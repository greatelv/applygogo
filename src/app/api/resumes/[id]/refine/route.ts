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

    const sourceLang = resume.sourceLang || "ko";

    // 2. Get extracted data from request body
    const { extractedData, saveToDb = false } = await request.json();

    if (!extractedData) {
      return NextResponse.json(
        { error: "Extracted data is required" },
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

    // 3. Refine with Gemini AI
    let refinedData = extractedData;

    if (
      extractedData.work_experiences &&
      extractedData.work_experiences.length > 0
    ) {
      console.log(
        `[Refine API] Starting refinement (${sourceLang}-based selection)...`
      );

      const refinementPrompt = getRefinementPrompt(extractedData);
      const refinementResult = await generateContentWithRetry(
        refinementModel,
        refinementPrompt
      );

      const refinedText = refinementResult.response.text();
      refinedData = JSON.parse(cleanJsonText(refinedText));

      const totalBullets =
        refinedData.work_experiences?.reduce(
          (sum: number, exp: any) => sum + (exp.bullets_original?.length || 0),
          0
        ) || 0;

      console.log(
        `[Refine API] Complete. ${
          refinedData.work_experiences?.length || 0
        } companies, ${totalBullets} bullets selected.`
      );

      // 4. Save to DB if requested (Global Expansion Track B)
      if (saveToDb) {
        console.log("[Refine API] Saving refined data to DB...");

        await prisma.$transaction(async (tx) => {
          // Delete existing experiences
          await tx.workExperience.deleteMany({
            where: { resumeId },
          });

          // Create new ones
          if (refinedData.work_experiences?.length > 0) {
            await tx.workExperience.createMany({
              data: refinedData.work_experiences.map(
                (exp: any, index: number) => ({
                  resumeId: resumeId,
                  company_name_original:
                    exp.company_name_original || "회사명 없음",
                  company_name_translated:
                    exp.company_name_translated ||
                    exp.company_name_original ||
                    "Unknown Company",
                  role_original: exp.role_original || "-",
                  role_translated:
                    exp.role_translated || exp.role_original || "-",
                  start_date: exp.start_date || "",
                  end_date: exp.end_date || "",
                  bullets_original: exp.bullets_original || [],
                  bullets_translated:
                    exp.bullets_translated || exp.bullets_original || [],
                  order: index,
                })
              ),
            });
          }

          // Update status
          await tx.resume.update({
            where: { id: resumeId },
            data: {
              status: "COMPLETED",
              current_step: "EDIT",
            },
          });
        });

        console.log("[Refine API] DB update complete.");
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
      { status: 500 }
    );
  }
}
