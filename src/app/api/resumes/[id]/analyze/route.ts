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
        { status: 402 },
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
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
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
    // - PDF에서 한글 원문만 정확히 추출
    // - 번역 없음, 고유명사 그대로
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

    console.log(
      `[Phase 1] Extraction complete. Found ${
        extractedData.work_experiences?.length || 0
      } experiences, ` +
        `${
          extractedData.work_experiences?.reduce(
            (sum: number, exp: any) => sum + (exp.bullets_source?.length || 0),
            0,
          ) || 0
        } total bullets.`,
    );

    // ========================================================================
    // PHASE 2: 정제 (Refinement) - 한글 기준
    // - 회사별 통합
    // - 스마트 불릿 선별 (3~5개)
    // - 아직 번역하지 않음
    // ========================================================================
    let refinedData = extractedData;

    if (
      extractedData.work_experiences &&
      extractedData.work_experiences.length > 0
    ) {
      console.log("[Phase 2] Starting refinement (Korean-based selection)...");

      try {
        const refinementPrompt = getRefinementPrompt(extractedData);
        const refinementResult = await generateContentWithRetry(
          geminiModel,
          refinementPrompt,
        );

        const refinedText = refinementResult.response.text();
        refinedData = JSON.parse(cleanJsonText(refinedText));

        const totalBullets =
          refinedData.work_experiences?.reduce(
            (sum: number, exp: any) => sum + (exp.bullets_source?.length || 0),
            0,
          ) || 0;

        console.log(
          `[Phase 2] Refinement complete. ${
            refinedData.work_experiences?.length || 0
          } companies, ${totalBullets} bullets selected.`,
        );
      } catch (error) {
        console.error(
          "[Phase 2] Refinement failed, using extracted data:",
          error,
        );
        // Fall back to extracted data if refinement fails
      }
    } else {
      console.log("[Phase 2] Skipped (no work experiences to refine)");
    }

    // ========================================================================
    // PHASE 3: 번역 (Translation)
    // - 정제된 한글 데이터를 영문으로 번역
    // - 고유명사는 로마자 표기만
    // ========================================================================
    console.log("[Phase 3] Starting translation...");

    const translationPrompt = getResumeTranslationPrompt(refinedData);
    const translationResult = await generateContentWithRetry(
      geminiModel,
      translationPrompt,
    );

    const translationText = translationResult.response.text();
    const translatedData = JSON.parse(cleanJsonText(translationText));

    console.log("[Phase 3] Translation complete.");

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
        bullets_source: Array.isArray(exp.bullets_source)
          ? exp.bullets_source.slice(0, 5)
          : [],
        bullets_target: Array.isArray(exp.bullets_target)
          ? exp.bullets_target.slice(0, 5)
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
          company_name_source: exp.company_name_source
            ? String(exp.company_name_source)
            : "회사명 없음",
          company_name_target: exp.company_name_target
            ? String(exp.company_name_target)
            : exp.company_name_source
              ? String(exp.company_name_source)
              : "Unknown Company",
          role_source: exp.role_source ? String(exp.role_source) : "-",
          role_target: exp.role_target
            ? String(exp.role_target)
            : exp.role_source
              ? String(exp.role_source)
              : "-",
          start_date: exp.start_date ? String(exp.start_date) : "",
          end_date: exp.end_date ? String(exp.end_date) : "",
          bullets_source: Array.isArray(exp.bullets_source)
            ? exp.bullets_source
            : [],
          bullets_target: Array.isArray(exp.bullets_target)
            ? exp.bullets_target
            : Array.isArray(exp.bullets_source)
              ? exp.bullets_source
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
          school_name: edu.school_name_source || edu.school_name, // fallback for legacy
          school_name_source: edu.school_name_source
            ? String(edu.school_name_source)
            : "학교명 없음",
          school_name_target: edu.school_name_target
            ? String(edu.school_name_target)
            : edu.school_name_source
              ? String(edu.school_name_source)
              : "Unknown School",
          major_source: edu.major_source ? String(edu.major_source) : "",
          major_target: edu.major_target
            ? String(edu.major_target)
            : edu.major_source
              ? String(edu.major_source)
              : "",
          degree_source: edu.degree_source ? String(edu.degree_source) : "",
          degree_target: edu.degree_target
            ? String(edu.degree_target)
            : edu.degree_source
              ? String(edu.degree_source)
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
          name_source: cert.name_source || cert.name || "Unknown Certification",
          name_target: cert.name_target || cert.name_en,
          description_source: cert.issuer_source || cert.issuer,
          description_target: cert.issuer_target || cert.issuer_en,
          date: cert.date ? String(cert.date) : undefined,
        });
      });
    }

    if (awards && awards.length > 0) {
      awards.forEach((award: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "AWARD",
          name_source: award.name_source || award.name || "Unknown Award",
          name_target: award.name_target || award.name_en,
          description_source: award.issuer_source || award.issuer,
          description_target: award.issuer_target || award.issuer_en,
          date: award.date ? String(award.date) : undefined,
        });
      });
    }

    if (languages && languages.length > 0) {
      languages.forEach((lang: any) => {
        additionalItemsData.push({
          resumeId: resumeId,
          type: "LANGUAGE",
          name_source: lang.name_source || lang.name || "Unknown Language",
          name_target: lang.name_target || lang.name_en,
          description_source: lang.level_source || lang.level,
          description_target: lang.level_target || lang.level_en,
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
        name_source: personalInfo.name_source || personalInfo.name_kr || "",
        name_target: personalInfo.name_target || personalInfo.name_en || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        links: personalInfo.links || [],
        summary_source:
          translatedData.summary_source ||
          translatedData.professional_summary_kr ||
          "",
        summary_target:
          translatedData.summary_target ||
          translatedData.professional_summary ||
          "",
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
      { status: 500 },
    );
  }
}
