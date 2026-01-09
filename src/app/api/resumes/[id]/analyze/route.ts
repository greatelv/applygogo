import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";
import { RESUME_ANALYSIS_PROMPT, getRefinementPrompt } from "@/lib/prompts";

// ... (imports)

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
    const cleanJsonText = (text: string) => {
      // 1. Try to match markdown code blocks (flexible)
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) return match[1];

      // 2. If no code block, try to find the outermost braces
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
      }

      // 3. Return original text as fallback
      return text;
    };

    const jsonText = cleanJsonText(responseText);
    const analysisResult = JSON.parse(jsonText);

    // 6. Second pass: Ask Gemini to merge duplicates and select best bullets
    const { work_experiences, educations, skills } = analysisResult;

    let mergedExperiences = work_experiences;

    if (work_experiences && work_experiences.length > 1) {
      console.log(
        `[Refinement] Starting second pass with ${work_experiences.length} experiences...`
      );

      try {
        const refinementPrompt = getRefinementPrompt(work_experiences);

        const refinementResult = await generateContentWithRetry(
          geminiModel,
          refinementPrompt
        );
        const refinedText = refinementResult.response.text();

        const refinedJsonText = cleanJsonText(refinedText);
        const refinedData = JSON.parse(refinedJsonText);

        mergedExperiences = refinedData.work_experiences;

        // Perform sorting: Newest first (descending by end_date)
        mergedExperiences.sort((a: any, b: any) => {
          const getTime = (dateStr: string) => {
            if (!dateStr) return 0;
            const lower = dateStr.toLowerCase();
            if (
              lower.includes("present") ||
              lower.includes("현재") ||
              lower.includes("재직")
            ) {
              return new Date().getTime() + 1000000; // Future date to keep at top
            }
            // Try to parse YYYY.MM format primarily used in resumes
            // Simple cleanup for common formats like '2023.01', '2023-01', 'Jan 2023'
            const cleanDate = dateStr.replace(/\./g, "-");
            const date = new Date(cleanDate);
            if (isNaN(date.getTime())) {
              // Try appending day if it's YYYY-MM
              const dateWithDay = new Date(cleanDate + "-01");
              return isNaN(dateWithDay.getTime()) ? 0 : dateWithDay.getTime();
            }
            return date.getTime();
          };

          return getTime(b.end_date) - getTime(a.end_date);
        });

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

    // Save certifications
    const { certifications, awards, languages } = analysisResult;

    if (certifications && certifications.length > 0) {
      await prisma.certification.createMany({
        data: certifications.map((cert: any) => ({
          resumeId: resumeId,
          name: cert.name ? String(cert.name) : "Unknown Certification",
          issuer: cert.issuer ? String(cert.issuer) : undefined,
          date: cert.date ? String(cert.date) : undefined,
        })),
      });
    }

    // Save awards
    if (awards && awards.length > 0) {
      await prisma.award.createMany({
        data: awards.map((award: any) => ({
          resumeId: resumeId,
          name: award.name ? String(award.name) : "Unknown Award",
          issuer: award.issuer ? String(award.issuer) : undefined,
          date: award.date ? String(award.date) : undefined,
        })),
      });
    }

    // Save languages
    if (languages && languages.length > 0) {
      await prisma.language.createMany({
        data: languages.map((lang: any) => ({
          resumeId: resumeId,
          name: lang.name ? String(lang.name) : "Unknown Language",
          level: lang.level ? String(lang.level) : undefined,
          score: lang.score ? String(lang.score) : undefined,
        })),
      });
    }

    // 7. Update resume status to COMPLETED and save personal info & summary
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
        summary: analysisResult.professional_summary || "",
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
