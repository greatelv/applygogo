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

export async function getUserSettings() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      usage_logs: true,
    },
  });

  if (!user) return null;

  // Calculate quota
  // For now, assume simplified monthly usage calc
  // Calculate usage based on plan type
  // Calculate usage based on plan type
  const isPro =
    user.subscription?.plan?.code === "PRO" &&
    user.subscription?.status === "ACTIVE";

  let periodStart: Date | null = null; // Default: All time (FREE)

  if (isPro && user.subscription?.current_period_start) {
    periodStart = new Date(user.subscription.current_period_start);
  }

  const usageCount = user.usage_logs
    .filter((log) => (periodStart ? log.created_at >= periodStart : true))
    .reduce((sum, log) => sum + log.amount, 0);

  const planQuota = user.subscription?.plan?.monthly_quota || 10; // Default to free tier quota (10)
  const remainingQuota = Math.max(0, planQuota - usageCount);

  return {
    ...user,
    subscription: user.subscription,
    remainingQuota,
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
    await supabaseAdmin.storage.from("resumes").remove([filePath]);
    throw new Error("데이터베이스 저장 중 오류가 발생했습니다.");
  }
}

export async function updateResumeTemplateAction(
  resumeId: string,
  template: "modern" | "classic" | "minimal"
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
            company_name_kr: exp.company,
            company_name_en: exp.companyEn,
            role_kr: exp.position,
            role_en: exp.positionEn,
            start_date: exp.period.split(" ~ ")[0] || "",
            end_date: exp.period.split(" ~ ")[1] || "",
            bullets_kr: exp.bullets,
            bullets_en: exp.bulletsEn,
            order: index,
          })),
        });
      }

      // 3. Create Educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            resumeId,
            school_name: edu.school_name,
            school_name_en: edu.school_name_en,
            major: edu.major,
            major_en: edu.major_en,
            degree: edu.degree,
            degree_en: edu.degree_en,
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
            name_kr: cert.name,
            description_kr: cert.issuer,
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
            name_kr: award.name,
            description_kr: award.issuer,
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
            name_kr: lang.name,
            description_kr: [lang.level, lang.score]
              .filter(Boolean)
              .join(" / "),
          })),
        });
      }

      // 8. Update Metadata
      await tx.resume.update({
        where: { id: resumeId, userId },
        data: {
          name_kr: personalInfo.name_kr,
          name_en: personalInfo.name_en,
          email: personalInfo.email,
          phone: personalInfo.phone,
          links: personalInfo.links,
          summary: personalInfo.summary || "",
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
