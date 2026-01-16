"use server";

import { signIn, signOut, auth } from "../../auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function authenticate() {
  await signIn("google", { redirectTo: "/resumes" });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function authenticateNaver() {
  await signIn("naver", { redirectTo: "/resumes" });
}

export async function authenticateWithCredentials(formData: FormData) {
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/resumes",
  });
}

export async function getUserSettings() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone_number: true,
      linkedin_url: true,
      portfolio_url: true,
      created_at: true,
      planType: true,
      planExpiresAt: true,
      credits: true,
    },
  });

  if (!user) return null;

  // Check if plan is expired and update if needed
  const now = new Date();
  let currentPlanType = user.planType;
  let currentPlanExpiresAt = user.planExpiresAt;

  if (
    user.planExpiresAt &&
    user.planExpiresAt <= now &&
    user.planType !== "FREE"
  ) {
    // Plan expired, update to FREE
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: "FREE",
        planExpiresAt: null,
      },
    });
    currentPlanType = "FREE";
    currentPlanExpiresAt = null;
  }

  return {
    ...user,
    planType: currentPlanType,
    planExpiresAt: currentPlanExpiresAt,
    remainingQuota: user.credits,
  };
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

  // Enforce 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("파일 용량이 5MB를 초과합니다.");
  }

  const userId = session.user.id;

  // Verify user exists in DB to prevent FK error
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
  }

  // Sanitize filename: remove special characters and keep only alphanumeric, dots, hyphens, underscores
  const sanitizedFileName = file.name
    .replace(/[^\w\s.-]/g, "") // Remove special chars except word chars, spaces, dots, hyphens
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_{2,}/g, "_"); // Replace multiple underscores with single

  const fileName = `${Date.now()}-${sanitizedFileName}`;
  const filePath = `${userId}/${fileName}`;

  // 1. Upload to Supabase Storage
  const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";
  console.log(
    `[Action] Uploading file to bucket: ${bucketName} path: ${filePath}`
  );

  const adminClient = getSupabaseAdmin();
  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "[Action] Storage upload error details:",
      JSON.stringify(uploadError, null, 2)
    );
    console.error(`[Action] URL used: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.error(
      `[Action] Key len: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.length}`
    );
    throw new Error("파일 업로드 중 오류가 발생했습니다.");
  }

  console.log("[Action] Upload success:", uploadData);

  // 2. Create DB record using Prisma
  try {
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        title: file.name.replace(/\.[^/.]+$/, ""),
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
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";
    await getSupabaseAdmin().storage.from(bucketName).remove([filePath]);
    throw new Error("데이터베이스 저장 중 오류가 발생했습니다.");
  }
}

export async function updateResumeTemplateAction(
  resumeId: string,

  template: "modern" | "classic" | "minimal" | "professional" | "executive"
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  // Map template string to Prisma enum
  const templateEnumMap = {
    modern: "MODERN",
    classic: "CLASSIC",
    minimal: "MINIMAL",
    professional: "PROFESSIONAL",
    executive: "EXECUTIVE",
  };

  try {
    await prisma.resume.update({
      where: {
        id: resumeId,
        userId: userId, // Security check
      },
      data: {
        selected_template: templateEnumMap[template] as any,
        status: "COMPLETED",
        current_step: "COMPLETED",
      },
    });

    revalidatePath("/resumes");
    revalidatePath(`/resumes/${resumeId}`);
    return { success: true };
  } catch (error) {
    console.error("Template update error:", error);
    throw new Error("템플릿 변경 사항을 저장하는 중 오류가 발생했습니다.");
  }
}

export async function updateResumeAction(
  resumeId: string,
  data: {
    personalInfo: any;
    experiences: any[];
    educations: any[];
    skills: any[];
    certifications?: any[];
    awards?: any[];
    languages?: any[];
  }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const {
    personalInfo,
    experiences,
    educations,
    skills,
    certifications,
    awards,
    languages,
  } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing
      await tx.workExperience.deleteMany({ where: { resumeId } });
      await tx.education.deleteMany({ where: { resumeId } });
      await tx.skill.deleteMany({ where: { resumeId } });
      await tx.additionalItem.deleteMany({ where: { resumeId } });

      // 2. Create Work Experiences
      if (experiences?.length > 0) {
        await tx.workExperience.createMany({
          data: experiences.map((exp: any, index: number) => ({
            resumeId,
            company_name_original: exp.company,
            company_name_translated: exp.companyTranslated,
            role_original: exp.position,
            role_translated: exp.positionTranslated,
            start_date: exp.period.split(" ~ ")[0] || "",
            end_date: exp.period.split(" ~ ")[1] || "",
            bullets_original: exp.bullets,
            bullets_translated: exp.bulletsTranslated,
            order: index,
          })),
        });
      }

      // 3. Create Educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            resumeId,
            school_name_original: edu.school_name,
            school_name_translated: edu.school_name_translated,
            major_original: edu.major,
            major_translated: edu.major_translated,
            degree_original: edu.degree,
            degree_translated: edu.degree_translated,
            start_date: edu.start_date,
            end_date: edu.end_date,
            order: index,
          })),
        });
      }

      // 4. Create Skills
      if (skills?.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any, index: number) => ({
            resumeId,
            name: skill.name,
            level: skill.level,
            order: index,
          })),
        });
      }

      // 5. Create Certifications
      // 5. Create Certifications (as Additional Items)
      if (certifications?.length > 0) {
        await tx.additionalItem.createMany({
          data: certifications.map((cert: any) => ({
            resumeId,
            type: "CERTIFICATION",
            name_original: cert.name,
            description_original: cert.issuer,
            date: cert.date,
          })),
        });
      }

      // 6. Create Awards
      // 6. Create Awards (as Additional Items)
      if (awards?.length > 0) {
        await tx.additionalItem.createMany({
          data: awards.map((award: any) => ({
            resumeId,
            type: "AWARD",
            name_original: award.name,
            description_original: award.issuer,
            date: award.date,
          })),
        });
      }

      // 7. Create Languages
      // 7. Create Languages (as Additional Items)
      if (languages?.length > 0) {
        await tx.additionalItem.createMany({
          data: languages.map((lang: any) => ({
            resumeId,
            type: "LANGUAGE",
            name_original: lang.name,
            description_original: [lang.level, lang.score]
              .filter(Boolean)
              .join(" / "),
          })),
        });
      }

      // 8. Update Metadata
      await tx.resume.update({
        where: { id: resumeId, userId },
        data: {
          name_original: personalInfo.name_original,
          name_translated: personalInfo.name_translated,
          email: personalInfo.email,
          phone: personalInfo.phone,
          links: personalInfo.links,
          summary_original: personalInfo.summary_original,
          summary_translated: personalInfo.summary || "",
          current_step: "TEMPLATE",
        },
      });
    });

    revalidatePath(`/resumes/${resumeId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update resume:", error);
    throw new Error("이력서 수정 사항을 저장하는 중 오류가 발생했습니다.");
  }
}

export async function deleteAccount() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    // Cascade delete is handled by Prisma schema
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    throw new Error("계정 삭제 중 오류가 발생했습니다.");
  }

  // Signout should be outside the try-catch block if it redirects
  await signOut({ redirectTo: "/" });
  return { success: true };
}
