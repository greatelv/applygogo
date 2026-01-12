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
            (sum: number, exp: any) => sum + (exp.bullets_kr?.length || 0),
            0
          ) || 0
        } total bullets.`
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
          refinementPrompt
        );

        const refinedText = refinementResult.response.text();
        refinedData = JSON.parse(cleanJsonText(refinedText));

        const totalBullets =
          refinedData.work_experiences?.reduce(
            (sum: number, exp: any) => sum + (exp.bullets_kr?.length || 0),
            0
          ) || 0;

        console.log(
          `[Phase 2] Refinement complete. ${
            refinedData.work_experiences?.length || 0
          } companies, ${totalBullets} bullets selected.`
        );
      } catch (error) {
        console.error(
          "[Phase 2] Refinement failed, using extracted data:",
          error
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
      translationPrompt
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
        bullets_kr: Array.isArray(exp.bullets_kr)
          ? exp.bullets_kr.slice(0, 5)
          : [],
        bullets_en: Array.isArray(exp.bullets_en)
          ? exp.bullets_en.slice(0, 5)
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
