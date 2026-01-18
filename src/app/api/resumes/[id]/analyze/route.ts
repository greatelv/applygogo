import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";
import {
  RESUME_EXTRACTION_PROMPT,
  getRefinementPrompt,
  getResumeTranslationPrompt,
} from "@/lib/prompts";
import {
  GLOBAL_RESUME_EXTRACTION_PROMPT,
  getGlobalRefinementPrompt,
  getGlobalResumeTranslationPrompt,
} from "@/lib/global-prompts";
import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 3단계 AI 프로세싱 API
// 1단계: 추출 (Extraction) - PDF에서 한글 원문만 정확히 추출
// 2단계: 정제 (Refinement) - 한글 기준으로 회사별 통합, 불릿 선별
// 3단계: 번역 (Translation) - 선별된 한글을 영문으로 번역
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;

    // 1. Check and update plan status
    const planStatus = await checkAndUpdatePlanStatus(session.user.id);
    const cost = calculateCost("GENERATE", planStatus.planType);

    // 2. Check credits
    const hasEnoughCredits = await checkCredits(session.user.id, cost);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          error: "크레딧이 부족합니다",
          requiredCredits: cost,
          currentCredits: planStatus.credits,
        },
        { status: 402 },
      );
    }

    // 3. Deduct credits
    await deductCredits(session.user.id, cost, "이력서 생성");

    // 4. Get resume from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const locale = (resume as any).locale || "ko";
    const isGlobal = locale === "en" || locale === "ja";

    // 5. Update status
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "PROCESSING" },
    });

    // 6. Download PDF
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.original_file_url);

    if (downloadError || !fileData) {
      throw new Error("Failed to download PDF from storage");
    }

    // 7. Base64 encode
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

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

    // ========================================================================
    // PHASE 1: EXTRACTION
    // ========================================================================
    console.log(`[Phase 1] Starting extraction for locale: ${locale}...`);

    // Import global prompts dynamically or use conditionals with top-level imports
    // (Assuming imports present at top of file, see imports section below)
    const extractionPrompt = isGlobal
      ? GLOBAL_RESUME_EXTRACTION_PROMPT
      : RESUME_EXTRACTION_PROMPT;

    const extractionResult = await generateContentWithRetry(geminiModel, [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      extractionPrompt,
    ]);

    const extractionText = extractionResult.response.text();
    const extractedData = JSON.parse(cleanJsonText(extractionText));

    console.log(
      `[Phase 1] Extraction complete. Items: ${extractedData.work_experiences?.length || 0}`,
    );

    // ========================================================================
    // PHASE 2: REFINEMENT
    // ========================================================================
    let refinedData = extractedData;
    if (extractedData.work_experiences?.length > 0) {
      console.log(`[Phase 2] Starting refinement...`);
      try {
        const getPrompt = isGlobal
          ? getGlobalRefinementPrompt
          : getRefinementPrompt;

        const refinementPrompt = getPrompt(extractedData);
        const refinementResult = await generateContentWithRetry(
          geminiModel,
          refinementPrompt,
        );
        const refinedText = refinementResult.response.text();
        refinedData = JSON.parse(cleanJsonText(refinedText));
        console.log(`[Phase 2] Refinement complete.`);
      } catch (error) {
        console.error("[Phase 2] Failed, falling back to extracted.", error);
      }
    }

    // ========================================================================
    // PHASE 3: TRANSLATION
    // ========================================================================
    console.log(`[Phase 3] Starting translation...`);

    // Select translation prompt
    let translationPrompt;
    if (isGlobal) {
      translationPrompt = getGlobalResumeTranslationPrompt(refinedData, locale);
    } else {
      translationPrompt = getResumeTranslationPrompt(refinedData);
    }

    const translationResult = await generateContentWithRetry(
      geminiModel,
      translationPrompt,
    );
    const translationText = translationResult.response.text();
    const translatedData = JSON.parse(cleanJsonText(translationText));

    console.log("[Phase 3] Translation complete.");

    // ========================================================================
    // SAVING TO DB
    // ========================================================================
    let finalExperiences = translatedData.work_experiences || [];

    // Sort Newest First
    finalExperiences.sort((a: any, b: any) => {
      const getTime = (d: string) => {
        if (!d) return 0;
        const clean = d.replace(/\./g, "-").toLowerCase();
        if (clean.includes("present") || clean.includes("현재"))
          return new Date().getTime() + 1000000;
        return new Date(clean).getTime() || 0;
      };
      return getTime(b.end_date) - getTime(a.end_date);
    });

    // Limit bullets safe-guard
    finalExperiences = finalExperiences.map((exp: any) => ({
      ...exp,
      bullets_kr: exp.bullets_kr?.slice(0, 5) || [],
      bullets_en: exp.bullets_en?.slice(0, 5) || [],
      bullets_ja: exp.bullets_ja?.slice(0, 5) || [],
    }));

    // Create Experiences
    if (finalExperiences.length > 0) {
      await prisma.workExperience.createMany({
        data: finalExperiences.map((exp: any, index: number) => ({
          resumeId,
          order: index,
          start_date: exp.start_date || "",
          end_date: exp.end_date || "",
          // Mapping handled by prompts returning suffixed keys
          company_name_kr: exp.company_name_kr || "Unknown",
          company_name_en: exp.company_name_en, // Optional
          company_name_ja: exp.company_name_ja, // Optional
          role_kr: exp.role_kr || "-",
          role_en: exp.role_en,
          role_ja: exp.role_ja,
          bullets_kr: exp.bullets_kr || [],
          bullets_en: exp.bullets_en,
          bullets_ja: exp.bullets_ja,
        })),
      });
    }

    // Create Educations
    const educations = translatedData.educations || [];
    if (educations.length > 0) {
      await prisma.education.createMany({
        data: educations.map((edu: any, index: number) => ({
          resumeId,
          order: index,
          start_date: edu.start_date || "",
          end_date: edu.end_date || "",
          school_name: edu.school_name || "Unknown", // Mapped to KR usually
          school_name_en: edu.school_name_en,
          school_name_ja: edu.school_name_ja,
          major: edu.major,
          major_en: edu.major_en,
          major_ja: edu.major_ja,
          degree: edu.degree,
          degree_en: edu.degree_en,
          degree_ja: edu.degree_ja,
        })),
      });
    }

    // Skills
    const skills = translatedData.skills || [];
    if (skills.length > 0) {
      // Normalized simple string array? or objects? Prompt says array of strings.
      // Check prompt output format: "skills": ["..."]
      const validSkills = skills.map((s: any, i: number) => ({
        resumeId,
        name: typeof s === "string" ? s : s.name || "Skill",
        order: i,
      }));
      if (validSkills.length > 0)
        await prisma.skill.createMany({ data: validSkills });
    }

    // Additional Items
    const addItems = [];
    const { certifications, awards, languages } = translatedData;

    if (certifications) {
      certifications.forEach((c: any) =>
        addItems.push({
          resumeId,
          type: "CERTIFICATION",
          name_kr: c.name_kr || c.name,
          name_en: c.name_en,
          name_ja: c.name_ja,
          description_kr: c.description_kr || c.issuer,
          description_en: c.description_en || c.issuer_en,
          description_ja: c.description_ja,
          date: c.date,
        }),
      );
    }
    if (awards) {
      awards.forEach((a: any) =>
        addItems.push({
          resumeId,
          type: "AWARD",
          name_kr: a.name_kr || a.name,
          name_en: a.name_en,
          name_ja: a.name_ja,
          description_kr: a.description_kr || a.issuer,
          description_en: a.description_en || a.issuer_en,
          description_ja: a.description_ja,
          date: a.date,
        }),
      );
    }
    if (languages) {
      languages.forEach((l: any) =>
        addItems.push({
          resumeId,
          type: "LANGUAGE",
          name_kr: l.name_kr || l.name,
          name_en: l.name_en,
          name_ja: l.name_ja,
          description_kr: l.description_kr || l.level,
          description_en: l.description_en || l.level_en,
          // no description_ja column? Wait, I added name_ja, description_ja in schema.
          description_ja: l.description_ja,
        }),
      );
    }

    if (addItems.length > 0) {
      // Force Any cast because TS types might lag
      await (prisma as any).additionalItem.createMany({
        data: addItems.map((item: any, i: number) => ({ ...item, order: i })),
      });
    }

    // Update Resume Status & Info
    const pInfo = translatedData.personal_info || {};
    await (prisma as any).resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        current_step: "EDIT",
        name_kr: pInfo.name_kr || pInfo.name || "",
        name_en: pInfo.name_en || "",
        name_ja: pInfo.name_ja,
        email: pInfo.email || "",
        phone: pInfo.phone || "",
        links: pInfo.links || [],
        summary: pInfo.summary || "", // Extracted EN/JA summary
        summary_kr: pInfo.summary_kr || "", // Translated KR summary
        summary_ja: pInfo.summary_ja,
      },
    });

    console.log("[Complete] Analysis finished.");
    return NextResponse.json({ success: true, message: "OK" });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    // Failure handling
    try {
      const { id } = await params;
      await prisma.resume.update({
        where: { id },
        data: {
          status: "FAILED",
          failure_message: error.message || "Unknown error",
        },
      });
    } catch (e) {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
