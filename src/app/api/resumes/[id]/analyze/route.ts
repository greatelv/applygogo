import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import {
  geminiModel,
  RESUME_ANALYSIS_PROMPT,
  generateContentWithRetry,
} from "@/lib/gemini";

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

    // 5. Analyze with Gemini AI using multimodal (PDF + text prompt)
    const result = await generateContentWithRetry(geminiModel, [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      RESUME_ANALYSIS_PROMPT,
    ]);

    const responseText = result.response.text();

    // Extract JSON from markdown code block if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;
    const analysisResult = JSON.parse(jsonText);

    // 6. Second pass: Ask Gemini to merge duplicates and select best bullets
    const { work_experiences, educations, skills } = analysisResult;

    let mergedExperiences = work_experiences;

    if (work_experiences && work_experiences.length > 1) {
      const refinementPrompt = `
다음은 이력서에서 추출한 경력사항 데이터입니다. 같은 회사가 여러 번 중복되어 나타날 수 있습니다.

**당신의 임무:**

1. **같은 회사 통합**
   - "주식회사 어베어", "주식회사어베어", "어베어", "Abear Inc." → 모두 같은 회사
   - "월급쟁이부자들(주)", "월급쟁이부자들", "Wolbu" → 모두 같은 회사
   - 띄어쓰기, 괄호, 주식회사/㈜ 표기, 영문명 차이는 무시하고 판단

2. **최고의 불릿 3~5개 선택**
   - 구체적인 수치/성과가 있는 것 우선
   - 기술 스택이 명시된 것 우선
   - 중복된 내용은 하나만 선택
   - 각 회사당 정확히 3~5개

3. **날짜 통합**
   - 같은 회사의 여러 기간이 있다면 가장 빠른 start_date, 가장 늦은 end_date 사용

**입력 데이터:**
${JSON.stringify(work_experiences, null, 2)}

**출력 형식:**
\`\`\`json
{
  "work_experiences": [
    {
      "company_name_kr": "정규화된 회사명 (가장 공식적인 표기)",
      "company_name_en": "영문 회사명",
      "role_kr": "대표 직무",
      "role_en": "Representative Role",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM 또는 현재",
      "bullets_kr": ["불릿1", "불릿2", "불릿3"],
      "bullets_en": ["Bullet1", "Bullet2", "Bullet3"]
    }
  ]
}
\`\`\`

**검증:**
- [ ] 각 회사는 정확히 1번만 나타나는가?
- [ ] 각 회사당 불릿이 3~5개인가?
- [ ] 선택된 불릿이 가장 임팩트 있는가?
`;

      const refinementResult = await generateContentWithRetry(
        geminiModel,
        refinementPrompt
      );
      const refinedText = refinementResult.response.text();

      const refinedJsonMatch = refinedText.match(/```json\n([\s\S]*?)\n```/);
      const refinedJsonText = refinedJsonMatch
        ? refinedJsonMatch[1]
        : refinedText;
      const refinedData = JSON.parse(refinedJsonText);

      mergedExperiences = refinedData.work_experiences;
    }

    // 7. Save to database

    // Save work experiences
    if (mergedExperiences && mergedExperiences.length > 0) {
      await prisma.workExperience.createMany({
        data: mergedExperiences.map((exp: any, index: number) => ({
          resumeId: resumeId,
          company_name_kr: exp.company_name_kr,
          company_name_en: exp.company_name_en || exp.company_name_kr,
          role_kr: exp.role_kr,
          role_en: exp.role_en || exp.role_kr,
          start_date: exp.start_date,
          end_date: exp.end_date,
          bullets_kr: exp.bullets_kr || [],
          bullets_en: exp.bullets_en || exp.bullets_kr || [],
          order: index,
        })),
      });
    }

    // Save educations
    if (educations && educations.length > 0) {
      await prisma.education.createMany({
        data: educations.map((edu: any, index: number) => ({
          resumeId: resumeId,
          school_name: edu.school_name,
          major: edu.major || "-", // Provide default for required field
          degree: edu.degree || "-", // Provide default for required field
          start_date: edu.start_date,
          end_date: edu.end_date,
          order: index,
        })),
      });
    }

    // Save skills
    if (skills && skills.length > 0) {
      await prisma.skill.createMany({
        data: skills.map((skill: any, index: number) => ({
          resumeId: resumeId,
          name: skill.name,
          level: skill.level,
          order: index,
        })),
      });
    }

    // 7. Update resume status to COMPLETED
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        current_step: "EDIT",
      },
    });

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
