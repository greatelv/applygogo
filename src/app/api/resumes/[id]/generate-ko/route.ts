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

    const headersList = await headers();
    const region = (headersList.get("x-application-region") || "KR") as Region;
    const prisma = getPrismaClient(region);

    const planStatus = await checkAndUpdatePlanStatus(session.user.id);
    const cost = 1;

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
    await deductCredits(session.user.id, cost, "국문 이력서 생성 (종합)");

    // Fetch Resume Data with Skills
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
      include: {
        work_experiences: {
          orderBy: { start_date: "desc" },
        },
        skills: true, // Include skills
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "PROCESSING" },
    });

    // Prepare Data for Prompt
    const experiences = resume.work_experiences.map((exp: any) => ({
      company: exp.company_name_original,
      role: exp.role_original,
      period: `${exp.start_date} ~ ${exp.end_date || "Present"}`,
      bullets: exp.bullets_original, // Assuming source extracted bullets
    }));
    const skills = resume.skills.map((s: any) => s.name);

    console.log(
      `[Narrative API] Generating structured essay for ${resumeId}...`
    );

    // Call Gemini
    const prompt = getNarrativeGenerationPrompt(experiences, skills);
    const result = await generateContentWithRetry(narrativeModel, prompt);

    // Parse Response
    const jsonText = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let narrativeData;
    try {
      narrativeData = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse narrative JSON", e);
      // Fallback: dummy structure if parse fails, or throw
      throw new Error("Failed to parse generated narrative content.");
    }

    // Save Result
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        convertedData: {
          type: "narrative_ko_v2", // New version tag
          content: narrativeData,
        },
        targetLang: "ko",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        type: "narrative_ko_v2",
        content: narrativeData,
      },
    });
  } catch (error: any) {
    console.error("Narrative generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate narrative" },
      { status: 500 }
    );
  }
}
