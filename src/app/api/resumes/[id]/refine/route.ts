import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { refinementModel, generateContentWithRetry } from "@/lib/gemini";
import { getRefinementPrompt } from "@/lib/prompts";

// ============================================================================
// 2단계: 정제 API (REFINEMENT) - 한글 기준
// - 회사별 통합
// - 스마트 불릿 선별 (3~5개)
// - 아직 번역하지 않음
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

    // 1. Verify resume ownership
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, user_id: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 2. Get extracted data from request body
    const { extractedData } = await request.json();

    if (!extractedData) {
      return NextResponse.json(
        { error: "Extracted data is required" },
        { status: 400 },
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

    // 3. Refine with Gemini AI
    let refinedData = extractedData;

    if (
      extractedData.work_experiences &&
      extractedData.work_experiences.length > 0
    ) {
      console.log(
        "[Refine API] Starting refinement (Korean-based selection)...",
      );

      const appLocale = (resume.app_locale || "ko") as "ko" | "en" | "ja";
      const refinementPrompt = getRefinementPrompt(extractedData, appLocale);
      const refinementResult = await generateContentWithRetry(
        refinementModel,
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
        `[Refine API] Complete. ${
          refinedData.work_experiences?.length || 0
        } companies, ${totalBullets} bullets selected.`,
      );

      // Data Validation: Ensure personal_info fields are preserved
      if (!refinedData.personal_info) {
        refinedData.personal_info = extractedData.personal_info || {};
      } else {
        const extractedPersonalInfo = extractedData.personal_info || {};

        // Preserve fields that AI might have omitted
        if (!refinedData.personal_info.email && extractedPersonalInfo.email) {
          refinedData.personal_info.email = extractedPersonalInfo.email;
          console.log("[Refine API] Restored email from extracted data");
        }

        if (!refinedData.personal_info.phone && extractedPersonalInfo.phone) {
          refinedData.personal_info.phone = extractedPersonalInfo.phone;
          console.log("[Refine API] Restored phone from extracted data");
        }

        if (!refinedData.personal_info.links && extractedPersonalInfo.links) {
          refinedData.personal_info.links = extractedPersonalInfo.links;
          console.log("[Refine API] Restored links from extracted data");
        }

        if (
          !refinedData.personal_info.summary_source &&
          extractedPersonalInfo.summary_source
        ) {
          refinedData.personal_info.summary_source =
            extractedPersonalInfo.summary_source;
          console.log(
            "[Refine API] Restored summary_source from extracted data",
          );
        }
      }
    } else {
      console.log("[Refine API] Skipped (no work experiences to refine)");
    }

    return NextResponse.json({
      success: true,
      data: refinedData,
    });
  } catch (error: any) {
    console.error("Refinement error:", error);

    // Update resume status to FAILED
    try {
      const { id: resumeId } = await params;
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "FAILED",
          failure_message: error.message || "Refinement failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update resume status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to refine resume" },
      { status: 500 },
    );
  }
}
