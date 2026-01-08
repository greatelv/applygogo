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
      console.log(
        `[Refinement] Starting second pass with ${work_experiences.length} experiences...`
      );

      try {
        const refinementPrompt = `
다음은 이력서에서 추출한 경력사항 데이터입니다. 같은 회사가 여러 번 중복되어 나타날 수 있습니다.

**CRITICAL INSTRUCTIONS (MUST FOLLOW):**

1. **GROUP BY COMPANY (회사 통합)**
   - Merge ALL entries for the same company into one.
   - Ignore minor differences (e.g., "(주)", "Inc.", spacing).


2. **STRICTLY LIMIT BULLETS (불릿 제한)**
   - **SELECT ONLY THE TOP 3-4 BULLETS PER COMPANY.**
   - **NEVER** exceed 4 bullets. This is a HARD LIMIT.
   - Select bullets with specific metrics (%, $) or technologies.
   - Merge similar bullets.

3. **DATE MERGING (날짜 통합)**
   - Use the earliest start_date and latest end_date.

**Input Data:**
${JSON.stringify(work_experiences, null, 2)}

**Output Format:**
\`\`\`json
{
  "work_experiences": [
    {
      "company_name_kr": "...",
      "company_name_en": "...",
      "role_kr": "...",
      "role_en": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets_kr": ["... (MAX 4 items)"],
      "bullets_en": ["... (MAX 4 items)"]
    }
  ]
}
\`\`\`

**Verification:**
- [ ] Merged duplicates?
- [ ] MAX 4 bullets per company? (CRITICAL)
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
        console.log(
          `[Refinement] Success! Reduced to ${mergedExperiences.length} companies`
        );
      } catch (error) {
        console.error("[Refinement] Failed, using original data:", error);
        // Fall back to original data if refinement fails
        mergedExperiences = work_experiences;
      }
    } else {
      console.log(
        `[Refinement] Skipped (only ${
          work_experiences?.length || 0
        } experiences)`
      );
    }

    // 7. Save to database

    // Fallback: Code-level enforcement of 4 bullets limit
    if (mergedExperiences && mergedExperiences.length > 0) {
      mergedExperiences = mergedExperiences.map((exp: any) => ({
        ...exp,
        bullets_kr: Array.isArray(exp.bullets_kr)
          ? exp.bullets_kr.slice(0, 4)
          : [],
        bullets_en: Array.isArray(exp.bullets_en)
          ? exp.bullets_en.slice(0, 4)
          : [],
      }));
    }

    // Save work experiences
    if (mergedExperiences && mergedExperiences.length > 0) {
      await prisma.workExperience.createMany({
        data: mergedExperiences.map((exp: any, index: number) => ({
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
          major: edu.major ? String(edu.major) : "-",
          major_en: edu.major_en
            ? String(edu.major_en)
            : edu.major
            ? String(edu.major)
            : "-",
          degree: edu.degree ? String(edu.degree) : "-",
          degree_en: edu.degree_en
            ? String(edu.degree_en)
            : edu.degree
            ? String(edu.degree)
            : "-",
          start_date: edu.start_date ? String(edu.start_date) : "",
          end_date: edu.end_date ? String(edu.end_date) : "",
          order: index,
        })),
      });
    }

    // Save skills
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

    // 7. Update resume status to COMPLETED and save personal info
    const personalInfo = analysisResult.personal_info || {};

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        current_step: "EDIT",
        name_kr: personalInfo.name_kr || "",
        name_en: personalInfo.name_en || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        links: personalInfo.links || [],
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
