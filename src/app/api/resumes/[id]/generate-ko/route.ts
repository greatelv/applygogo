import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaClient, Region } from "@/lib/prisma";
import { narrativeModel, generateContentWithRetry } from "@/lib/gemini";
import { getNarrativeGenerationPrompt } from "@/lib/prompts";
import { headers } from "next/headers";
import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 국문 이력서 생성 API (Reverse Generation)
// - 영문 불렛 -> 국문 서술형 자소서(Narrative) 변환
// - Global User (Source: EN) -> Target: KO
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

    // 1. Determine Region and Get DB Client
    const headersList = await headers();
    const region = (headersList.get("x-application-region") || "KR") as Region;
    const prisma = getPrismaClient(region);

    // 2. Billing Check (Optional: You might want to charge for this)
    // Assuming same cost as 'GENERATE' or 'TRANSLATE'
    const planStatus = await checkAndUpdatePlanStatus(session.user.id);
    const cost = 1; // 1 Credit for narrative generation? Or calculate based on length?
    // Let's assume 1 credit for now as it's a high-value feature.
    // Or reuse calculateCost("TRANSLATE", ...) ?
    // Let's hardcode 1 or use existing logic if compatible. "GENERATE" is extraction.

    // Check credits
    const hasEnoughCredits = await checkCredits(session.user.id, cost);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          error: "Not enough credits",
          requiredCredits: cost,
          currentCredits: planStatus.credits,
        },
        { status: 402 }
      );
    }
    await deductCredits(session.user.id, cost, "국문 이력서 생성");

    // 3. Fetch Resume Data
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
      include: {
        work_experiences: {
          orderBy: { start_date: "desc" }, // Usually stored as string YYYY-MM, works ok for sort if consistent
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 4. Update Status
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "PROCESSING" },
    });

    const workExperiences = resume.work_experiences;
    const narrativeResults = [];

    // 5. Generate Narrative for each Work Experience
    for (const exp of workExperiences) {
      // Assuming 'bullets_original' holds the SOURCE text (even if English) as per schema convention
      // If the user is global, they uploaded EN resume, extracted to 'bullets_original'.
      // We should detect if it is proper to generate narrative.

      const sourceBullets = exp.bullets_original as string[]; // JSON array

      if (!sourceBullets || sourceBullets.length === 0) continue;

      console.log(`[Narrative API] Generating for exp ${exp.id}...`);

      const prompt = getNarrativeGenerationPrompt(
        sourceBullets,
        exp.role_original
      ); // Pass role as context

      const result = await generateContentWithRetry(narrativeModel, prompt);

      // Parse JSON output
      const jsonText = result.response
        .text()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      let generatedNarrative: string[] = [];
      try {
        generatedNarrative = JSON.parse(jsonText);
      } catch (e) {
        console.error("Failed to parse narrative JSON", e);
        // Fallback: split by newline if parse fails
        generatedNarrative = jsonText
          .split("\n")
          .filter((line) => line.trim().length > 0);
      }

      narrativeResults.push({
        id: exp.id,
        role: exp.role_original,
        company: exp.company_name_original,
        narrative_ko: generatedNarrative,
      });
    }

    // 6. Save to convertedData
    // We update the resume record.
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        convertedData: {
          type: "narrative_ko", // Metadata tag
          work_experiences: narrativeResults,
        },
        targetLang: "ko",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        type: "narrative_ko",
        work_experiences: narrativeResults,
      },
    });
  } catch (error: any) {
    console.error("Narrative generation error:", error);

    // Fail status update logic... needs prisma client
    const headersList = await headers();
    const region = (headersList.get("x-application-region") || "KR") as Region;
    const prisma = getPrismaClient(region);
    const { id: resumeId } = await params;

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "FAILED", failure_message: error.message },
    });

    return NextResponse.json(
      { error: error.message || "Failed to generate narrative" },
      { status: 500 }
    );
  }
}
