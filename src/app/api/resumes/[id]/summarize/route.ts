import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini, SUMMARY_PROMPT } from "@/lib/gemini";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const resume = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!resume || !resume.rawText) {
      return NextResponse.json(
        { error: "Resume not found or no text available" },
        { status: 404 }
      );
    }

    // Call Gemini
    const prompt = SUMMARY_PROMPT.replace("{{TEXT}}", resume.rawText);
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON
    let workExperiences;
    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]") + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);
      workExperiences = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON Parse Error:", e, "Raw Text:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Transaction: Delete old experiences, insert new ones, update status
    await prisma.$transaction(async (tx) => {
      await tx.workExperience.deleteMany({ where: { resumeId: id } });

      for (const [index, exp] of workExperiences.entries()) {
        await tx.workExperience.create({
          data: {
            resumeId: id,
            companyNameKr: exp.companyName,
            roleKr: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            bulletsKr: exp.bullets,
            order: index,
          },
        });
      }

      await tx.resume.update({
        where: { id },
        data: {
          currentStep: "SUMMARY",
          status: "PROCESSING", // Still processing until translated
        },
      });

      // TODO: Deduct Quota here
    });

    return NextResponse.json({ success: true, workExperiences });
  } catch (error) {
    console.error("Summarize API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
