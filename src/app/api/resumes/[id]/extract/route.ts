import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";
import { RESUME_EXTRACTION_PROMPT } from "@/lib/prompts";

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

    // 1. Get resume from DB
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
      `[Extract API] Complete. Found ${
        extractedData.work_experiences?.length || 0
      } experiences, ` +
        `${
          extractedData.work_experiences?.reduce(
            (sum: number, exp: any) => sum + (exp.bullets_kr?.length || 0),
            0
          ) || 0
        } total bullets.`
    );

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
