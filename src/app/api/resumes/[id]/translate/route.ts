import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { translationModel, generateContentWithRetry } from "@/lib/gemini";
import { getResumeTranslationPrompt } from "@/lib/prompts";

// ============================================================================
// 3단계: 번역 API (TRANSLATION)
// - 정제된 한글 데이터를 영문으로 번역
// - 고유명사는 로마자 표기만
// - Action Verb 사용하여 성과 중심으로
// - 최종 결과를 DB에 저장
// ============================================================================

import { checkCredits, deductCredits } from "@/lib/billing";

// ============================================================================
// 3단계: 번역 API (TRANSLATION)
// - 정제된 한글 데이터를 영문으로 번역
// - 고유명사는 로마자 표기만
// - Action Verb 사용하여 성과 중심으로
// - 최종 결과를 DB에 저장
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

    // 1. Verify resume ownership
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Determine cost based on resume status
    // If status is COMPLETED, it's a re-translation (1.0 credit)
    // Otherwise (IDLE, PROCESSING, FAILED), it's a new generation (5.0 credit)
    // Note: 'FAILED' might be a retry of a failed attempt, which arguably shouldn't cost full price or should?
    // Usually retrying a failed system error shouldn't cost, but if user retries...
    // Let's assume FAILED -> 1.0 because it didn't complete successfully.
    // Ideally if it failed due to system error, we verify if credit was deducted.
    // Since we deduct AT THE END, a FAILED attempt didn't cost anything. So retrying it costs 1.0. Correct.
    const cost = resume.status === "COMPLETED" ? 1.0 : 5.0;
    const isRetranslation = resume.status === "COMPLETED";

    // Check credits
    const hasCredits = await checkCredits(session.user.id, cost);
    if (!hasCredits) {
      return NextResponse.json(
        {
          error:
            "크레딧이 부족합니다. 플랜을 업그레이드하거나 크레딧을 충전해주세요.",
        },
        { status: 403 }
      );
    }

    // 2. Get refined data from request body
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

    const translationPrompt = getResumeTranslationPrompt(refinedData);
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
        bullets_kr: Array.isArray(exp.bullets_kr)
          ? exp.bullets_kr.slice(0, 5)
          : [],
        bullets_en: Array.isArray(exp.bullets_en)
          ? exp.bullets_en.slice(0, 5)
          : [],
      }));
    }

    // 5. Save to Database

    // Save work experiences
    if (finalExperiences && finalExperiences.length > 0) {
      await prisma.workExperience.createMany({
        data: finalExperiences.map((exp: any, index: number) => ({
          resumeId: resumeId,
          company_name_kr: exp.company_name_kr
            ? String(exp.company_name_kr)
            : "회사명 없음",
          company_name_en: exp.company_name_en
            ? String(exp.company_name_en)
            : exp.company_name_kr
            ? String(exp.company_name_kr)
            : "Unknown Company",
          role_kr: exp.role_kr ? String(exp.role_kr) : "-",
          role_en: exp.role_en
            ? String(exp.role_en)
            : exp.role_kr
            ? String(exp.role_kr)
            : "-",
          start_date: exp.start_date ? String(exp.start_date) : "",
          end_date: exp.end_date ? String(exp.end_date) : "",
          bullets_kr: Array.isArray(exp.bullets_kr) ? exp.bullets_kr : [],
          bullets_en: Array.isArray(exp.bullets_en)
            ? exp.bullets_en
            : Array.isArray(exp.bullets_kr)
            ? exp.bullets_kr
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
          school_name: edu.school_name
            ? String(edu.school_name)
            : "학교명 없음",
          school_name_en: edu.school_name_en
            ? String(edu.school_name_en)
            : edu.school_name
            ? String(edu.school_name)
            : "Unknown School",
          major: edu.major ? String(edu.major) : "",
          major_en: edu.major_en
            ? String(edu.major_en)
            : edu.major
            ? String(edu.major)
            : "",
          degree: edu.degree ? String(edu.degree) : "",
          degree_en: edu.degree_en
            ? String(edu.degree_en)
            : edu.degree
            ? String(edu.degree)
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
          name_kr: cert.name ? String(cert.name) : "Unknown Certification",
          name_en: cert.name_en ? String(cert.name_en) : undefined,
          description_kr: cert.issuer ? String(cert.issuer) : undefined,
          description_en: cert.issuer_en ? String(cert.issuer_en) : undefined,
          date: cert.date ? String(cert.date) : undefined,
        });
      });
    }

    if (awards && awards.length > 0) {
      awards.forEach((award: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "AWARD",
          name_kr: award.name ? String(award.name) : "Unknown Award",
          name_en: award.name_en ? String(award.name_en) : undefined,
          description_kr: award.issuer ? String(award.issuer) : undefined,
          description_en: award.issuer_en ? String(award.issuer_en) : undefined,
          date: award.date ? String(award.date) : undefined,
        });
      });
    }

    if (languages && languages.length > 0) {
      languages.forEach((lang: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "LANGUAGE",
          name_kr: lang.name ? String(lang.name) : "Unknown Language",
          name_en: lang.name_en ? String(lang.name_en) : undefined,
          description_kr: lang.level ? String(lang.level) : undefined,
          description_en: lang.score ? String(lang.score) : undefined,
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
        name_kr: personalInfo.name_kr || "",
        name_en: personalInfo.name_en || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        links: personalInfo.links || [],
        summary: translatedData.professional_summary || "",
        summary_kr: translatedData.professional_summary_kr || "",
      },
    });

    // Deduct credits
    await deductCredits(
      session.user.id,
      cost,
      isRetranslation
        ? `이력서 재번역 (Resume ID: ${resumeId})`
        : `이력서 생성 (Resume ID: ${resumeId})`
    );

    console.log(
      `[Translate API] All data saved successfully. Deducted ${cost} credits.`
    );

    return NextResponse.json({
      success: true,
      message: "Resume analysis completed",
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
