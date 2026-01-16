import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { translationModel, generateContentWithRetry } from "@/lib/gemini";
import {
  getResumeTranslationPrompt,
  getResumeEnToKoTranslationPrompt,
} from "@/lib/prompts";
import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 재번역 API (RE-TRANSLATION)
// - 편집된 한글 데이터를 영문으로 재번역
// - Free 사용자: 1 크레딧 차감
// - Paid 사용자: 0 크레딧 (무제한)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;

    // 1. Check and update plan status
    const planStatus = await checkAndUpdatePlanStatus(session.user.id);

    // 4. Verify resume ownership
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const sourceLang = resume.sourceLang || "ko";

    // 2. Calculate cost for RETRANSLATE action
    // 만약 이미 완료된 이력서라면(재번역) 비용 발생, 초기 생성 중이라면 0
    const isReTranslation = resume.status === "COMPLETED";
    const cost = isReTranslation
      ? calculateCost("RETRANSLATE", planStatus.planType)
      : 0;

    // 3. Check if user has enough credits
    const hasEnoughCredits = await checkCredits(session.user.id, cost);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          error: "크레딧이 부족합니다",
          requiredCredits: cost,
          currentCredits: planStatus.credits,
        },
        { status: 402 }
      );
    }

    // 5. Get refined data from request body
    const { refinedData } = await request.json();

    if (!refinedData) {
      return NextResponse.json(
        { error: "Refined data is required" },
        { status: 400 }
      );
    }

    // Helper function to clean JSON from markdown code blocks
    const cleanJsonText = (text: string) => {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) return match[1];

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
      }

      return text;
    };

    // 3. Translate with Gemini AI
    console.log("[Translate API] Starting translation...");

    const isEnSource = sourceLang === "en";
    const translationPrompt = isEnSource
      ? getResumeEnToKoTranslationPrompt(refinedData)
      : getResumeTranslationPrompt(refinedData);

    const translationResult = await generateContentWithRetry(
      translationModel,
      translationPrompt
    );

    const translationText = translationResult.response.text();
    const translatedData = JSON.parse(cleanJsonText(translationText));

    console.log("[Translate API] Translation complete.");

    // 4. Post-processing
    let finalExperiences = translatedData.work_experiences || [];

    // Sort experiences: Newest first (descending by end_date)
    finalExperiences.sort((a: any, b: any) => {
      const getTime = (dateStr: string) => {
        if (!dateStr) return 0;
        const lower = dateStr.toLowerCase();
        if (
          lower.includes("present") ||
          lower.includes("현재") ||
          lower.includes("재직")
        ) {
          return new Date().getTime() + 1000000;
        }
        const cleanDate = dateStr.replace(/\./g, "-");
        const date = new Date(cleanDate);
        if (isNaN(date.getTime())) {
          const dateWithDay = new Date(cleanDate + "-01");
          return isNaN(dateWithDay.getTime()) ? 0 : dateWithDay.getTime();
        }
        return date.getTime();
      };

      return getTime(b.end_date) - getTime(a.end_date);
    });

    // Code-level enforcement of 5 bullets limit (safety net)
    if (finalExperiences && finalExperiences.length > 0) {
      finalExperiences = finalExperiences.map((exp: any) => ({
        ...exp,
        bullets_original: Array.isArray(exp.bullets_original)
          ? exp.bullets_original.slice(0, 5)
          : [],
        bullets_translated: Array.isArray(exp.bullets_translated)
          ? exp.bullets_translated.slice(0, 5)
          : [],
      }));
    }

    // 5. Save to Database

    // Save work experiences
    if (finalExperiences && finalExperiences.length > 0) {
      await prisma.workExperience.createMany({
        data: finalExperiences.map((exp: any, index: number) => ({
          resumeId: resumeId,
          company_name_original: exp.company_name_original
            ? String(exp.company_name_original)
            : "회사명 없음",
          company_name_translated: exp.company_name_translated
            ? String(exp.company_name_translated)
            : exp.company_name_original
            ? String(exp.company_name_original)
            : "Unknown Company",
          role_original: exp.role_original ? String(exp.role_original) : "-",
          role_translated: exp.role_translated
            ? String(exp.role_translated)
            : exp.role_original
            ? String(exp.role_original)
            : "-",
          start_date: exp.start_date ? String(exp.start_date) : "",
          end_date: exp.end_date ? String(exp.end_date) : "",
          bullets_original: Array.isArray(exp.bullets_original)
            ? exp.bullets_original
            : [],
          bullets_translated: Array.isArray(exp.bullets_translated)
            ? exp.bullets_translated
            : Array.isArray(exp.bullets_original)
            ? exp.bullets_original
            : [],
          order: index,
        })),
      });
    }

    // Save educations
    const educations = translatedData.educations || [];
    if (educations && educations.length > 0) {
      await prisma.education.createMany({
        data: educations.map((edu: any, index: number) => ({
          resumeId: resumeId,
          school_name_original: edu.school_name_original
            ? String(edu.school_name_original)
            : "학교명 없음",
          school_name_translated: edu.school_name_translated
            ? String(edu.school_name_translated)
            : edu.school_name_original
            ? String(edu.school_name_original)
            : "Unknown School",
          major_original: edu.major_original ? String(edu.major_original) : "",
          major_translated: edu.major_translated
            ? String(edu.major_translated)
            : edu.major_original
            ? String(edu.major_original)
            : "",
          degree_original: edu.degree_original
            ? String(edu.degree_original)
            : "",
          degree_translated: edu.degree_translated
            ? String(edu.degree_translated)
            : edu.degree_original
            ? String(edu.degree_original)
            : "",
          start_date: edu.start_date ? String(edu.start_date) : "",
          end_date: edu.end_date ? String(edu.end_date) : "",
          order: index,
        })),
      });
    }

    // Save skills
    const skills = translatedData.skills || [];
    if (skills && skills.length > 0) {
      const validSkills = skills
        .filter((skill: any) => {
          if (typeof skill === "string") return skill.trim().length > 0;
          if (typeof skill === "object" && skill.name) return true;
          return false;
        })
        .map((skill: any, index: number) => {
          const rawName = typeof skill === "string" ? skill : skill.name;
          const safeName = rawName ? String(rawName) : "Unknown Skill";
          return {
            resumeId: resumeId,
            name: safeName,
            order: index,
          };
        });

      if (validSkills.length > 0) {
        await prisma.skill.createMany({
          data: validSkills,
        });
      }
    }

    // Save additional items (certifications, awards, languages)
    const { certifications, awards, languages } = translatedData;
    const additionalItemsData: any[] = [];

    if (certifications && certifications.length > 0) {
      certifications.forEach((cert: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "CERTIFICATION",
          name_original: cert.name_original
            ? String(cert.name_original)
            : "Unknown Certification",
          name_translated: cert.name_translated
            ? String(cert.name_translated)
            : undefined,
          description_original: cert.issuer ? String(cert.issuer) : undefined,
          description_translated: cert.issuer_translated
            ? String(cert.issuer_translated)
            : undefined,
          date: cert.date ? String(cert.date) : undefined,
        });
      });
    }

    if (awards && awards.length > 0) {
      awards.forEach((award: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "AWARD",
          name_original: award.name_original
            ? String(award.name_original)
            : "Unknown Award",
          name_translated: award.name_translated
            ? String(award.name_translated)
            : undefined,
          description_original: award.issuer ? String(award.issuer) : undefined,
          description_translated: award.issuer_translated
            ? String(award.issuer_translated)
            : undefined,
          date: award.date ? String(award.date) : undefined,
        });
      });
    }

    if (languages && languages.length > 0) {
      languages.forEach((lang: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "LANGUAGE",
          name_original: lang.name_original
            ? String(lang.name_original)
            : "Unknown Language",
          name_translated: lang.name_translated
            ? String(lang.name_translated)
            : undefined,
          description_original: lang.level ? String(lang.level) : undefined,
          description_translated: lang.score ? String(lang.score) : undefined,
          date: undefined,
        });
      });
    }

    if (additionalItemsData.length > 0) {
      await (prisma as any).additionalItem.createMany({
        data: additionalItemsData.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
    }

    // Update resume status to COMPLETED and save personal info & summary
    const personalInfo = translatedData.personal_info || {};

    await (prisma as any).resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        current_step: "EDIT",
        sourceLang: sourceLang,
        targetLang: sourceLang === "en" ? "ko" : "en",
        name_original: personalInfo.name_original || "",
        name_translated: personalInfo.name_translated || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        links: personalInfo.links || [],
        summary_translated:
          translatedData.professional_summary_translated || "",
        summary_original: translatedData.professional_summary_original || "",
      },
    });

    // Deduct credits
    await deductCredits(session.user.id, cost, "이력서 재번역");

    console.log(
      `[Translate API] All data saved successfully. Deducted ${cost} credits.`
    );

    return NextResponse.json({
      success: true,
      data: translatedData,
      message: "Resume re-translation completed",
    });
  } catch (error: any) {
    console.error("Translation error:", error);

    // Update resume status to FAILED
    try {
      const { id: resumeId } = await params;
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "FAILED",
          failure_message: error.message || "Translation failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update resume status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to translate resume" },
      { status: 500 }
    );
  }
}
