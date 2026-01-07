"use server";

import { signIn, signOut, auth } from "../../auth";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function authenticate() {
  await signIn("google", { redirectTo: "/resumes" });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function uploadResumeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("파일이 없습니다.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("PDF 파일만 업로드 가능합니다.");
  }

  const userId = session.user.id;

  // Sanitize filename: remove special characters and keep only alphanumeric, dots, hyphens, underscores
  const sanitizedFileName = file.name
    .replace(/[^\w\s.-]/g, "") // Remove special chars except word chars, spaces, dots, hyphens
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_{2,}/g, "_"); // Replace multiple underscores with single

  const fileName = `${Date.now()}-${sanitizedFileName}`;
  const filePath = `${userId}/${fileName}`;

  // 1. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("resumes")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error("파일 업로드 중 오류가 발생했습니다.");
  }

  // 2. Create DB record using Prisma
  try {
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        title: file.name,
        original_file_url: uploadData.path,
        status: "IDLE",
        current_step: "UPLOAD",
      },
    });

    revalidatePath("/resumes");
    return { success: true, resumeId: resume.id };
  } catch (dbError) {
    console.error("Database error:", dbError);
    // Cleanup storage if DB fails
    await supabaseAdmin.storage.from("resumes").remove([filePath]);
    throw new Error("데이터베이스 저장 중 오류가 발생했습니다.");
  }
}
