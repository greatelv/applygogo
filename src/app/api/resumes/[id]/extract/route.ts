import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { extractionModel, generateContentWithRetry } from "@/lib/gemini";
import { RESUME_EXTRACTION_PROMPT } from "@/lib/prompts";

import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 1단계: 추출 API (EXTRACTION)
// - PDF에서 한글 원문만 정확히 추출
// - 번역 없음, 고유명사 그대로
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

    // 2. Update status to PROCESSING
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
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) return match[1];

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
      }

      return text;
    };

    // 5. Extract with Gemini AI
    console.log("[Extract API] Starting extraction...");

    const extractionResult = await generateContentWithRetry(extractionModel, [
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

    // 6. Validate if it's a resume
    if (extractedData.is_resume === false) {
      console.log("[Extract API] Not a resume. Deleting data...");

      // Clean up data since it's not a resume
      try {
        // Delete file from storage
        if (resume.original_file_url) {
          await getSupabaseAdmin()
            .storage.from(bucketName)
            .remove([resume.original_file_url]);
        }

        // Delete record from DB
        await prisma.resume.delete({
          where: { id: resumeId },
        });

        console.log("[Extract API] Successfully deleted invalid resume data");
      } catch (cleanupError) {
        console.error("Failed to clean up invalid resume data:", cleanupError);
        // Continue to return error even if cleanup fails
      }

      return NextResponse.json(
        {
          error:
            "업로드된 파일이 이력서 양식이 아닌 것으로 판단됩니다. 올바른 이력서 파일을 업로드해주세요.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[Extract API] Complete. Found ${
        extractedData.work_experiences?.length || 0
      } experiences, ` +
        `${
          extractedData.work_experiences?.reduce(
            (sum: number, exp: any) =>
              sum + (exp.bullets_original?.length || 0),
            0
          ) || 0
        } total bullets.`
    );

    // 7. Save detected language to DB for subsequent steps
    const detectedLanguage = extractedData.metadata?.detected_language || "ko";
    await prisma.resume.update({
      where: { id: resumeId },
      data: { sourceLang: detectedLanguage },
    });

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error: any) {
    console.error("Extraction error:", error);

    // Update resume status to FAILED
    try {
      const { id: resumeId } = await params;
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "FAILED",
          failure_message: error.message || "Extraction failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update resume status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to extract resume" },
      { status: 500 }
    );
  }
}
