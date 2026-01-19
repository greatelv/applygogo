"use server";

import { signIn, signOut, auth } from "../../auth";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function authenticate(locale?: string) {
  await signIn("google", { redirectTo: `/${locale || "ko"}/resumes` });
}

export async function logOut(redirectTo?: string) {
  await signOut({ redirectTo: redirectTo || "/" });
}

export async function authenticateNaver(locale?: string) {
  await signIn("naver", { redirectTo: `/${locale || "ko"}/resumes` });
}

export async function authenticateWithCredentials(
  locale: string,
  formData: FormData,
) {
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: `/${locale || "ko"}/resumes`,
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
      plan_type: true,
      plan_expires_at: true,
      credits: true,
    },
  });

  if (!user) return null;

  // Check if plan is expired and update if needed
  const now = new Date();
  let currentPlanType = user.plan_type;
  let currentPlanExpiresAt = user.plan_expires_at;

  if (
    user.plan_expires_at &&
    user.plan_expires_at <= now &&
    user.plan_type !== "FREE"
  ) {
    // Plan expired, update to FREE
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan_type: "FREE",
        plan_expires_at: null,
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

export async function uploadResumeAction(locale: string, formData: FormData) {
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

  // Use UUID for filename to avoid encoding issues with Korean filenames
  const fileName = `${crypto.randomUUID()}.pdf`;
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
        id: crypto.randomUUID(),
        user: { connect: { id: userId } },
        title: file.name.replace(/\.[^/.]+$/, ""),
        original_file_url: uploadData.path,
        status: "IDLE",
        current_step: "UPLOAD",
        locale: locale || "ko",
        app_locale: locale || "ko", // Set app_locale
        updated_at: new Date(),
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

  template: "modern" | "classic" | "minimal" | "professional" | "executive",
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
        user_id: userId, // Security check (Note: verify if id/user_id compound key exists or separate)
      },
      data: {
        selected_template: templateEnumMap[template] as any,
        status: "COMPLETED",
        current_step: "COMPLETED",
        updated_at: new Date(),
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
    additionalItems?: any[];
  },
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
    // extra items might be merged into additionalItems
    additionalItems,
  } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing
      await tx.workExperience.deleteMany({ where: { resume_id: resumeId } });
      await tx.education.deleteMany({ where: { resume_id: resumeId } });
      await tx.skill.deleteMany({ where: { resume_id: resumeId } });
      await tx.additionalItem.deleteMany({ where: { resume_id: resumeId } });

      // 2. Create Work Experiences
      if (experiences?.length > 0) {
        await tx.workExperience.createMany({
          data: experiences.map((exp: any, index: number) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId,
            company_name_source: exp.company_name_source || "",
            company_name_target: exp.company_name_target || "",
            role_source: exp.role_source || "",
            role_target: exp.role_target || "",
            start_date: exp.start_date || "",
            end_date: exp.end_date || "",
            bullets_source: exp.bullets_source || [],
            bullets_target: exp.bullets_target || [],
            // Legacy / Required fields (deprecated)
            company_name_kr: "",
            role_kr: "",
            bullets_kr: [],
            order: index,
          })),
        });
      }

      // 3. Create Educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId,
            school_name_source: edu.school_name_source || "",
            school_name_target: edu.school_name_target || "",
            major_source: edu.major_source || "",
            major_target: edu.major_target || "",
            degree_source: edu.degree_source || "",
            degree_target: edu.degree_target || "",
            start_date: edu.start_date || "",
            end_date: edu.end_date || "",
            // Legacy / Required fields (deprecated)
            school_name: "",
            major: "",
            degree: "",
            order: index,
          })),
        });
      }

      // 4. Create Skills
      if (skills?.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any, index: number) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId,
            name: skill.name || "",
            level: skill.level || "",
            order: index,
          })),
        });
      }

      // 5. Create Additional Items (consolidated)
      if (additionalItems?.length > 0) {
        await tx.additionalItem.createMany({
          data: additionalItems.map((item: any) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId,
            // Map legacy types if necessary, or use item.type directly
            type: item.type,
            name_source: item.name_source || "",
            name_target: item.name_target || "",
            description_source: item.description_source || "",
            description_target: item.description_target || "",
            date: item.date || "",
            // Legacy / Required fields (deprecated)
            name_kr: "",
            description_kr: "",
          })),
        });
      }

      // 6. Update Metadata
      await tx.resume.update({
        where: { id: resumeId, user_id: userId },
        data: {
          name_source: personalInfo.name_source,
          name_target: personalInfo.name_target,
          email: personalInfo.email,
          phone: personalInfo.phone,
          links: personalInfo.links,
          summary_source: personalInfo.summary_source || "",
          summary_target: personalInfo.summary_target || "",
          current_step: "TEMPLATE",
          updated_at: new Date(),
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

export async function deleteAccount(redirectTo?: string) {
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

  await signOut({ redirectTo: redirectTo || "/" });
  return { success: true };
}
