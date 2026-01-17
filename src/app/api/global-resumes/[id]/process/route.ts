import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  extractResumeData,
  translateToKorean,
  refineForKoreanCulture,
} from "@/lib/global-resume-ai";

/**
 * POST /api/global-resumes/[id]/process
 * 다국어 이력서 AI 프로세싱 (3단계: 추출 → 번역 → 정제)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 이력서 조회 및 권한 검증
    const resume = await prisma.globalResume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 크레딧 확인 (베타 기간에는 무제한)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    const isBeta = true; // TODO: 베타 종료 후 false로 변경
    if (!isBeta && (!user || user.credits < 5)) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 },
      );
    }

    // ========================================
    // Stage 1: 추출 (Extract)
    // ========================================
    await prisma.globalResume.update({
      where: { id },
      data: {
        status: "PROCESSING",
        current_step: "PROCESSING",
        failure_message: null,
      },
    });

    console.log(`[${id}] Stage 1: Extracting resume data...`);
    const extracted = await extractResumeData(
      resume.original_file_url,
      resume.sourceLocale as "en" | "ja",
    );

    // 추출된 원본 데이터 저장
    await prisma.globalResume.update({
      where: { id },
      data: {
        detectedLocale: extracted.detectedLanguage,
        name_original: extracted.personalInfo.name,
        email: extracted.personalInfo.email,
        phone: extracted.personalInfo.phone,
        links: extracted.personalInfo.links || null,
        summary_original: extracted.summary || "",
      },
    });

    // WorkExperience 저장 (원본)
    for (let i = 0; i < extracted.workExperiences.length; i++) {
      const exp = extracted.workExperiences[i];
      await prisma.globalWorkExperience.create({
        data: {
          resumeId: id,
          company_name_original: exp.company_name,
          role_original: exp.role,
          start_date: exp.start_date,
          end_date: exp.end_date,
          bullets_original: exp.bullets,
          order: i,
        },
      });
    }

    // Education 저장 (원본)
    for (let i = 0; i < extracted.educations.length; i++) {
      const edu = extracted.educations[i];
      await prisma.globalEducation.create({
        data: {
          resumeId: id,
          school_name_original: edu.school_name,
          major_original: edu.major,
          degree_original: edu.degree,
          start_date: edu.start_date,
          end_date: edu.end_date,
          order: i,
        },
      });
    }

    // Skills 저장
    for (let i = 0; i < extracted.skills.length; i++) {
      const skill = extracted.skills[i];
      await prisma.globalSkill.create({
        data: {
          resumeId: id,
          name: skill.name,
          level: skill.level || null,
          order: i,
        },
      });
    }

    // Additional Items 저장 (원본)
    for (let i = 0; i < extracted.additionalItems.length; i++) {
      const item = extracted.additionalItems[i];
      await prisma.globalAdditionalItem.create({
        data: {
          resumeId: id,
          type: item.type,
          name_original: item.name,
          description_original: item.description || "",
          date: item.date || null,
          order: i,
        },
      });
    }

    console.log(`[${id}] Stage 1 completed: Extraction done`);

    // ========================================
    // Stage 2: 번역 (Translate)
    // ========================================
    console.log(`[${id}] Stage 2: Translating to Korean...`);
    const translated = await translateToKorean(
      extracted,
      resume.sourceLocale as "en" | "ja",
    );

    // 번역된 데이터 저장 (임시)
    await prisma.globalResume.update({
      where: { id },
      data: {
        name_translated: translated.personalInfo.name,
        summary_translated: translated.summary || "",
      },
    });

    console.log(`[${id}] Stage 2 completed: Translation done`);

    // ========================================
    // Stage 3: 정제 (Refine)
    // ========================================
    console.log(`[${id}] Stage 3: Refining for Korean culture...`);
    const refined = await refineForKoreanCulture(translated);

    // 정제된 데이터로 최종 업데이트
    await prisma.globalResume.update({
      where: { id },
      data: {
        name_translated: refined.personalInfo.name,
        summary_translated: refined.summary || "",
        status: "COMPLETED",
        current_step: "EDIT_TRANSLATION",
      },
    });

    // WorkExperience 번역 업데이트
    const workExps = await prisma.globalWorkExperience.findMany({
      where: { resumeId: id },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < workExps.length; i++) {
      if (refined.workExperiences[i]) {
        await prisma.globalWorkExperience.update({
          where: { id: workExps[i].id },
          data: {
            company_name_translated: refined.workExperiences[i].company_name,
            role_translated: refined.workExperiences[i].role,
            bullets_translated: refined.workExperiences[i].bullets,
          },
        });
      }
    }

    // Education 번역 업데이트
    const educations = await prisma.globalEducation.findMany({
      where: { resumeId: id },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < educations.length; i++) {
      if (refined.educations[i]) {
        await prisma.globalEducation.update({
          where: { id: educations[i].id },
          data: {
            school_name_translated: refined.educations[i].school_name,
            major_translated: refined.educations[i].major,
            degree_translated: refined.educations[i].degree,
          },
        });
      }
    }

    // Additional Items 번역 업데이트
    const additionalItems = await prisma.globalAdditionalItem.findMany({
      where: { resumeId: id },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < additionalItems.length; i++) {
      if (refined.additionalItems[i]) {
        await prisma.globalAdditionalItem.update({
          where: { id: additionalItems[i].id },
          data: {
            name_translated: refined.additionalItems[i].name,
            description_translated:
              refined.additionalItems[i].description || "",
          },
        });
      }
    }

    console.log(`[${id}] Stage 3 completed: Refinement done`);

    // 크레딧 차감 (베타 기간에는 스킵)
    if (!isBeta) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 5 } },
      });

      await prisma.usageLog.create({
        data: {
          userId: session.user.id,
          amount: -5,
          description: `Global Resume AI Processing (${resume.sourceLocale}→ko)`,
        },
      });
    }

    // 최종 결과 반환
    const finalResume = await prisma.globalResume.findUnique({
      where: { id },
      include: {
        work_experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        additionalItems: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      resume: finalResume,
      message: "AI processing completed successfully (3 stages)",
    });
  } catch (error: any) {
    console.error("Error processing global resume:", error);

    // params를 다시 await
    const { id } = await params;

    // 실패 상태 업데이트
    try {
      await prisma.globalResume.update({
        where: { id },
        data: {
          status: "FAILED",
          failure_message: error.message || "AI processing failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to process resume" },
      { status: 500 },
    );
  }
}
