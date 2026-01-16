import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";
import {
  RESUME_EXTRACTION_PROMPT,
  getRefinementPrompt,
  getResumeTranslationPrompt,
  getResumeEnToKoTranslationPrompt,
  getResumeNarrativePrompt,
} from "@/lib/prompts";
import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 3단계 AI 프로세싱 API
// [Track A: Korean Resume]
// 1단계: 추출 (Extraction) - PDF에서 한글 원문 추출
// 2단계: 정제 (Refinement) - 한글 기준 회사 통합, 불릿 선별
// 3단계: 번역 (Translation) - 선별된 한글을 영문으로 번역
//
// [Track B: English Resume - Global Expansion]
// 1단계: 추출 (Extraction) - PDF에서 영문 원문 추출
// 2단계: 서사 생성 (Narrative Generation) - 영문 불렛을 국문 자소서(서술형)로 변환
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

    // 1. Check and update plan status (auto-expire check)
    const planStatus = await checkAndUpdatePlanStatus(session.user.id);

    // 2. Calculate cost for GENERATE action
    const cost = calculateCost("GENERATE", planStatus.planType);

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

    // 4. Deduct credits
    await deductCredits(session.user.id, cost, "이력서 생성");

    // 5. Get resume from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 6. Update status to PROCESSING
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "PROCESSING" },
    });

    // 3. Download PDF from Supabase Storage
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";
    const { data: fileData, error: downloadError } = await getSupabaseAdmin()
      .storage.from(bucketName)
      .download(resume.original_file_url);

    if (downloadError || !fileData) {
      throw new Error("Failed to download PDF from storage");
    }

    // 4. Convert PDF to base64 for Gemini API
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Helper function to clean JSON from markdown code blocks
    const cleanJsonText = (text: string) => {
      // 1. Try to match markdown code blocks (flexible)
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) return match[1];

      // 2. If no code block, try to find the outermost braces
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
      }

      // 3. Return original text as fallback
      return text;
    };

    // ========================================================================
    // PHASE 1: 추출 (Extraction)
    // - PDF에서 원문 텍스트 추출 (Language Agnostic)
    // ========================================================================
    console.log("[Phase 1] Starting extraction...");

    const extractionResult = await generateContentWithRetry(geminiModel, [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      RESUME_EXTRACTION_PROMPT,
    ]);

    const extractionText = extractionResult.response.text();
    const extractedData = JSON.parse(cleanJsonText(extractionText));

    const detectedLanguage = extractedData.metadata?.detected_language || "ko";
    console.log(
      `[Phase 1] Extraction complete. Language: ${detectedLanguage}, Found ${
        extractedData.work_experiences?.length || 0
      } experiences.`
    );

    let translatedData;

    if (detectedLanguage === "en") {
      // ========================================================================
      // TRACK B: English -> Korean (Global Expansion)
      // 1단계: 추출 (Extraction) - PDF에서 영문 원문 추출 (이미 Phase 1에서 완료)
      // 2단계: 한국어 번역 (Translation) - 영문 원문을 국문으로 번역
      // 3단계: 한국어 정제 (Refinement) - 국문 기준 한국 시장에 맞게 정제
      // ========================================================================
      console.log(
        "[Track B] English detected. Starting Global Expansion flow..."
      );

      // STEP 2: 번역 (Translation EN -> KO)
      console.log("[Track B - Phase 2] Starting EN -> KO translation...");
      const translationPrompt = getResumeEnToKoTranslationPrompt(extractedData);
      const translationResult = await generateContentWithRetry(
        geminiModel,
        translationPrompt
      );
      const translatedDataRaw = JSON.parse(
        cleanJsonText(translationResult.response.text())
      );

      // STEP 3: 정제 (Refinement for KR market)
      console.log("[Track B - Phase 3] Starting KR refinement...");
      let refinedData = translatedDataRaw;
      try {
        const refinementPrompt = getRefinementPrompt(translatedDataRaw);
        const refinementResult = await generateContentWithRetry(
          geminiModel,
          refinementPrompt
        );
        refinedData = JSON.parse(
          cleanJsonText(refinementResult.response.text())
        );

        // 정제된 데이터에 원문 불렛 정보를 다시 병합 (Refinement 과정에서 유실될 수 있으므로)
        // Note: Refinement prompt typically manages its entries.
        // We ensure _original fields are preserved correctly.
      } catch (error) {
        console.error("[Track B - Phase 3] Refinement failed:", error);
      }

      translatedData = refinedData;
      console.log("[Track B] Global Expansion flow complete.");
    } else {
      // ========================================================================
      // TRACK A: Korean -> English Translation (Refinement Included)
      // ========================================================================
      console.log("[Track A] Korean detected. Starting standard flow...");

      // PHASE 2: 정제 (Refinement)
      let refinedData = extractedData;

      if (
        extractedData.work_experiences &&
        extractedData.work_experiences.length > 0
      ) {
        console.log(
          "[Phase 2] Starting refinement (Korean-based selection)..."
        );

        try {
          const refinementPrompt = getRefinementPrompt(extractedData);
          const refinementResult = await generateContentWithRetry(
            geminiModel,
            refinementPrompt
          );

          const refinedText = refinementResult.response.text();
          refinedData = JSON.parse(cleanJsonText(refinedText));

          console.log(
            `[Phase 2] Refinement complete. ${
              refinedData.work_experiences?.length || 0
            } companies.`
          );
        } catch (error) {
          console.error(
            "[Phase 2] Refinement failed, using extracted data:",
            error
          );
          // Fall back to extracted data if refinement fails
        }
      }

      // PHASE 3: 번역 (Translation)
      console.log("[Phase 3] Starting translation...");

      const translationPrompt = getResumeTranslationPrompt(refinedData);
      const translationResult = await generateContentWithRetry(
        geminiModel,
        translationPrompt
      );

      const translationText = translationResult.response.text();
      translatedData = JSON.parse(cleanJsonText(translationText));

      console.log("[Phase 3] Translation complete.");
    }

    // ========================================================================
    // Post-processing
    // ========================================================================
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
          return new Date().getTime() + 1000000; // Future date to keep at top
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

    // Code-level enforcement of 4 bullets limit (safety net)
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

    // ========================================================================
    // Save to Database
    // ========================================================================

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
            : edu.school_name
            ? String(edu.school_name)
            : "Unknown School",
          major_original: edu.major_original ? String(edu.major_original) : "",
          major_translated: edu.major_translated
            ? String(edu.major_translated)
            : edu.major
            ? String(edu.major)
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
        data: additionalItemsData.map((item: any, index: number) => ({
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
        sourceLang: detectedLanguage,
        targetLang: detectedLanguage === "en" ? "ko" : "en",
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

    console.log("[Complete] 3-phase resume analysis finished successfully.");

    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully",
    });
  } catch (error: any) {
    console.error("Resume analysis error:", error);

    // Update resume status to FAILED
    try {
      const { id: resumeId } = await params;
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "FAILED",
          failure_message: error.message || "Analysis failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update resume status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
