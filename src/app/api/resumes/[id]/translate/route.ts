import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gemini, TRANSLATE_PROMPT } from "@/lib/gemini";

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

    // Fetch all work experiences for this resume
    const experiences = await prisma.workExperience.findMany({
      where: { resumeId: id },
      orderBy: { order: "asc" },
    });

    if (experiences.length === 0) {
      return NextResponse.json(
        { error: "No work experiences found to translate" },
        { status: 404 }
      );
    }

    // Process each experience
    // Note: Doing this in loop might be slow. In prod, parallelize or batch.
    // For MVP, we'll do it sequentially to avoid rate limits or use Promise.all.

    // We will use Promise.all for speed, but be careful with rate limits.
    const translatedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        const bulletsKr = exp.bulletsKr as string[];
        if (!bulletsKr || bulletsKr.length === 0) return exp;

        const prompt = TRANSLATE_PROMPT.replace(
          "{{BULLETS}}",
          JSON.stringify(bulletsKr)
        );

        try {
          const result = await gemini.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const jsonStart = text.indexOf("[");
          const jsonEnd = text.lastIndexOf("]") + 1;
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const bulletsEn = JSON.parse(jsonStr);

          // Update DB
          return prisma.workExperience.update({
            where: { id: exp.id },
            data: {
              bulletsEn: bulletsEn,
              // Simple translation for company/role for now, or just keep same?
              // Let's assume user edits company/role manually or we add prompt for it.
              // For now, let's just copy KR to EN if empty, or leave it.
              // Actually, let's prompt AI for company/role translation too?
              // To keep it simple: only translate bullets as per PROMPT.
              // User can edit headers.
            },
          });
        } catch (e) {
          console.error(`Failed to translate experience ${exp.id}`, e);
          return exp;
        }
      })
    );

    await prisma.resume.update({
      where: { id },
      data: {
        currentStep: "TRANSLATE",
        status: "COMPLETED", // Done!
      },
    });

    // TODO: Deduct Quota

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translate API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
