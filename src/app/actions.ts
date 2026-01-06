"use server";

import { signIn, signOut, auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/gemini";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function login() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function uploadResume(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    throw new Error("파일이 없습니다.");
  }

  // 1. Check Quota (Simplified for MVP)
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const maxResumes = subscription?.plan?.maxResumes ?? 1; // Default 1 for free/no-sub

  if (maxResumes !== -1) {
    const count = await prisma.resume.count({
      where: { userId: session.user.id },
    });

    if (count >= maxResumes) {
      throw new Error(
        "이력서 생성 한도를 초과했습니다. 플랜을 업그레이드해주세요."
      );
    }
  }

  // 2. Save Temp File
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempPath = join("/tmp", `resume-${Date.now()}-${file.name}`);
  await writeFile(tempPath, buffer);

  let resumeId: string | undefined;

  try {
    // 3. Analyze with Gemini
    const analysis = await analyzeResume(tempPath);

    // 4. Save to DB
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: file.name.replace(".pdf", ""),
        originalFileUrl: "TRANSIT_ONLY",
        targetRole: "TBD",
        status: "COMPLETED",

        workExperiences: {
          create: analysis.workExperience.map((exp, index) => ({
            companyNameKr: exp.companyNameKr,
            companyNameEn: exp.companyNameEn,
            roleKr: exp.roleKr,
            roleEn: exp.roleEn,
            startDate: exp.startDate,
            endDate: exp.endDate,
            bulletsKr: exp.bulletsKr ?? [],
            bulletsEn: exp.bulletsEn ?? [],
            order: index,
          })),
        },
        educations: {
          create: analysis.education.map((edu, index) => ({
            schoolName: edu.schoolName,
            major: edu.major,
            degree: edu.degree,
            startDate: edu.startDate,
            endDate: edu.endDate,
            order: index,
          })),
        },
        skills: {
          create: analysis.skills.map((skill, index) => ({
            name: skill.name,
            level: skill.level,
            order: index,
          })),
        },
      },
    });

    // Store ID for redirect and logging
    resumeId = resume.id;

    // 5. Log Usage
    await prisma.usageLog.create({
      data: {
        userId: session.user.id,
        amount: 1.0,
        description: `Resume Analysis: ${resume.id}`,
      },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      await unlink(tempPath);
    } catch (e) {}
  }

  // Redirect outside try-catch to avoid catching NEXT_REDIRECT
  if (resumeId) {
    redirect(`/dashboard/resumes/${resumeId}`);
  }
}
