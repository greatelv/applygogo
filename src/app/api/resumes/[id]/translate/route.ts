import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { translationModel, generateContentWithRetry } from "@/lib/gemini";
import { getTranslationPrompt } from "@/lib/prompts";
import {
  calculateCost,
  checkCredits,
  deductCredits,
  checkAndUpdatePlanStatus,
} from "@/lib/billing";

// ============================================================================
// 3단계: 번역 API (TRANSLATION)
// - 정제된 Source 데이터를 Target으로 번역
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

    // 1. Check and update plan status
    const planStatus = await checkAndUpdatePlanStatus(session.user.id);

    // 4. Verify resume ownership
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, user_id: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 2. Calculate cost for RETRANSLATE action
    const isReTranslation = resume.status === "COMPLETED";
    const cost = isReTranslation
      ? calculateCost("RETRANSLATE", planStatus.planType)
      : 0;

    // 3. Check if user has enough credits
    const hasEnoughCredits = await checkCredits(session.user.id, cost);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          error: "크레딧이 부족합니다",
          requiredCredits: cost,
          currentCredits: planStatus.credits,
        },
        { status: 402 },
      );
    }

    // 5. Get refined data from request body
    const { refinedData } = await request.json();

    if (!refinedData) {
      return NextResponse.json(
        { error: "Refined data is required" },
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

    // 3. Translate with Gemini AI
    console.log("[Translate API] Starting translation...");

    const appLocale = (resume.app_locale || "ko") as "ko" | "en" | "ja";
    const translationPrompt = getTranslationPrompt(refinedData, appLocale);
    const translationResult = await generateContentWithRetry(
      translationModel,
      translationPrompt,
    );

    const translationText = translationResult.response.text();
    const translatedData = JSON.parse(cleanJsonText(translationText));

    console.log("[Translate API] Translation complete.");

    // 4. Data Validation & Fallback
    // Ensure critical fields are not lost during translation
    if (!translatedData.personal_info) {
      translatedData.personal_info = {};
    }

    const refinedPersonalInfo = refinedData.personal_info || {};

    // Preserve fields that AI might have omitted
    if (!translatedData.personal_info.email && refinedPersonalInfo.email) {
      translatedData.personal_info.email = refinedPersonalInfo.email;
      console.log("[Translate API] Restored email from refined data");
    }

    if (!translatedData.personal_info.phone && refinedPersonalInfo.phone) {
      translatedData.personal_info.phone = refinedPersonalInfo.phone;
      console.log("[Translate API] Restored phone from refined data");
    }

    if (!translatedData.personal_info.links && refinedPersonalInfo.links) {
      translatedData.personal_info.links = refinedPersonalInfo.links;
      console.log("[Translate API] Restored links from refined data");
    }

    // Normalize Summary (Source)
    if (!translatedData.personal_info.summary_source) {
      translatedData.personal_info.summary_source =
        translatedData.personal_info.summary ||
        translatedData.personal_info.summary_kr ||
        translatedData.personal_info.about ||
        "";
    }

    // Normalize Summary (Target)
    if (!translatedData.personal_info.summary_target) {
      translatedData.personal_info.summary_target =
        translatedData.personal_info.summary_en ||
        translatedData.personal_info.summary_us ||
        "";
    }

    // Normalize Links
    if (
      translatedData.personal_info.links &&
      Array.isArray(translatedData.personal_info.links)
    ) {
      translatedData.personal_info.links =
        translatedData.personal_info.links.map((link: any) => ({
          label: link.label || link.name || link.title || "Link",
          url: link.url || link.link || link.href || "",
        }));
    }

    if (
      !translatedData.personal_info.summary_source &&
      (refinedPersonalInfo.summary_source || refinedPersonalInfo.summary)
    ) {
      translatedData.personal_info.summary_source =
        refinedPersonalInfo.summary_source || refinedPersonalInfo.summary;
      console.log("[Translate API] Restored summary_source from refined data");
    }

    if (
      !translatedData.personal_info.summary_target &&
      refinedPersonalInfo.summary_target
    ) {
      translatedData.personal_info.summary_target =
        refinedPersonalInfo.summary_target;
      console.log("[Translate API] Restored summary_target from refined data");
    }

    // 5. Post-processing
    let finalExperiences = translatedData.work_experiences || [];

    // Sort experiences: Newest first (descending by end_date)
    finalExperiences.sort((a: any, b: any) => {
      const getTime = (dateStr: string) => {
        if (!dateStr) return 0;
        const lower = dateStr.toLowerCase();
        if (
          lower.includes("present") ||
          lower.includes("현재") ||
          lower.includes("재직")
        ) {
          return new Date().getTime() + 1000000;
        }
        const cleanDate = dateStr.replace(/\./g, "-");
        const date = new Date(cleanDate);
        if (isNaN(date.getTime())) {
          const dateWithDay = new Date(cleanDate + "-01");
          return isNaN(dateWithDay.getTime()) ? 0 : dateWithDay.getTime();
        }
        return date.getTime();
      };

      return getTime(b.end_date) - getTime(a.end_date);
    });

    // Code-level enforcement of 5 bullets limit (safety net)
    if (finalExperiences && finalExperiences.length > 0) {
      finalExperiences = finalExperiences.map((exp: any) => ({
        ...exp,
        bullets_source: Array.isArray(exp.bullets_source)
          ? exp.bullets_source.slice(0, 5)
          : [],
        bullets_target: Array.isArray(exp.bullets_target)
          ? exp.bullets_target.slice(0, 5)
          : [],
      }));
    }

    // 5. Save to Database
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Clear existing related data to prevent duplicates on re-translation
      // FK replaced: resumeId -> resume_id
      await tx.workExperience.deleteMany({ where: { resume_id: resumeId } });
      await tx.education.deleteMany({ where: { resume_id: resumeId } });
      await tx.skill.deleteMany({ where: { resume_id: resumeId } });
      await tx.additionalItem.deleteMany({ where: { resume_id: resumeId } });

      // Save work experiences
      if (finalExperiences && finalExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: finalExperiences.map((exp: any, index: number) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId, // FK replaced
            company_name_source: exp.company_name_source
              ? String(exp.company_name_source)
              : "Unknown Company",
            company_name_target: exp.company_name_target
              ? String(exp.company_name_target)
              : undefined,
            role_source: exp.role_source ? String(exp.role_source) : "-",
            role_target: exp.role_target ? String(exp.role_target) : undefined,
            start_date: exp.start_date ? String(exp.start_date) : "",
            end_date: exp.end_date ? String(exp.end_date) : "",
            bullets_source: Array.isArray(exp.bullets_source)
              ? exp.bullets_source
              : [],
            bullets_target: Array.isArray(exp.bullets_target)
              ? exp.bullets_target
              : [],
            order: index,

            // Legacy fallbacks (optional, can be empty string if strictly deprecated)
            company_name_kr: "",
            role_kr: "",
            bullets_kr: [],
          })),
        });
      }

      // Save educations
      const educations = translatedData.educations || [];
      if (educations && educations.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            id: crypto.randomUUID(),
            resume_id: resumeId, // FK replaced
            school_name_source: edu.school_name_source
              ? String(edu.school_name_source)
              : "Unknown School",
            school_name_target: edu.school_name_target
              ? String(edu.school_name_target)
              : undefined,
            major_source: edu.major_source ? String(edu.major_source) : "",
            major_target: edu.major_target
              ? String(edu.major_target)
              : undefined,
            degree_source: edu.degree_source ? String(edu.degree_source) : "",
            degree_target: edu.degree_target
              ? String(edu.degree_target)
              : undefined,
            start_date: edu.start_date ? String(edu.start_date) : "",
            end_date: edu.end_date ? String(edu.end_date) : "",
            order: index,

            // Legacy
            school_name: "",
            major: "",
            degree: "",
          })),
        });
      }

      // Save skills
      const skills = translatedData.skills || [];
      if (skills && skills.length > 0) {
        const validSkills = skills
          .filter((skill: any) => {
            if (typeof skill === "string") return skill.trim().length > 0;
            if (typeof skill === "object" && (skill.name || skill.name_source))
              return true;
            return false;
          })
          .map((skill: any, index: number) => {
            // Handle both string and object formats
            let name_source = "";
            let name_target = "";

            if (typeof skill === "string") {
              name_source = String(skill);
              name_target = String(skill);
            } else {
              name_source = skill.name_source || skill.name || "Unknown Skill";
              name_target = skill.name_target || skill.name || name_source;
            }

            return {
              id: crypto.randomUUID(),
              resume_id: resumeId,
              name: name_source,
              name_source: name_source,
              name_target: name_target,
              order: index,
            };
          });

        if (validSkills.length > 0) {
          await tx.skill.createMany({
            data: validSkills,
          });
        }
      }

      // Save additional items
      const { certifications, awards, languages } = translatedData;
      const additionalItemsData: any[] = [];

      if (certifications && certifications.length > 0) {
        certifications.forEach((cert: any) => {
          additionalItemsData.push({
            id: crypto.randomUUID(),
            resume_id: resumeId, // FK replaced
            type: "CERTIFICATION",
            name_source: cert.name_source
              ? String(cert.name_source)
              : "Unknown",
            name_target: cert.name_target
              ? String(cert.name_target)
              : undefined,
            description_source: cert.description_source || undefined,
            date: cert.date ? String(cert.date) : undefined,
            name_kr: "", // Legacy
          });
        });
      }

      if (awards && awards.length > 0) {
        awards.forEach((award: any) => {
          additionalItemsData.push({
            id: crypto.randomUUID(),
            resume_id: resumeId, // FK replaced
            type: "AWARD",
            name_source: award.name_source
              ? String(award.name_source)
              : "Unknown",
            name_target: award.name_target
              ? String(award.name_target)
              : undefined,
            description_source: award.description_source || undefined,
            date: award.date ? String(award.date) : undefined,
            name_kr: "", // Legacy
          });
        });
      }

      if (languages && languages.length > 0) {
        languages.forEach((lang: any) => {
          additionalItemsData.push({
            id: crypto.randomUUID(),
            resume_id: resumeId, // FK replaced
            type: "LANGUAGE",
            name_source: lang.name_source
              ? String(lang.name_source)
              : "Unknown",
            name_target: lang.name_target
              ? String(lang.name_target)
              : undefined,
            description_source: lang.level ? String(lang.level) : undefined,
            name_kr: "", // Legacy
          });
        });
      }

      if (additionalItemsData.length > 0) {
        await tx.additionalItem.createMany({
          data: additionalItemsData.map((item, index) => ({
            ...item,
            order: index,
          })),
        });
      }

      // Update resume status
      const personalInfo = translatedData.personal_info || {};
      await tx.resume.update({
        where: { id: resumeId },
        data: {
          status: "COMPLETED",
          current_step: "EDIT",
          name_source: personalInfo.name_source || "",
          name_target: personalInfo.name_target || "",
          email: personalInfo.email || "",
          phone: personalInfo.phone || "",
          links: personalInfo.links || [],
          summary_source: personalInfo.summary_source || "",
          summary_target: personalInfo.summary_target || "",

          // Legacy fallbacks
          name_kr: "",
          title: `${personalInfo.name_source || "Resume"}`,
        },
      });
    });

    // Deduct credits
    await deductCredits(session.user.id, cost, "이력서 재번역");

    console.log(
      `[Translate API] All data saved successfully. Deducted ${cost} credits.`,
    );

    return NextResponse.json({
      success: true,
      message: "Resume re-translation completed",
    });
  } catch (error: any) {
    console.error("Translation error:", error);

    // Update resume status to FAILED
    try {
      const { id: resumeId } = await params;
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "FAILED",
          failure_message: error.message || "Translation failed",
        },
      });
    } catch (updateError) {
      console.error("Failed to update resume status:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to translate resume" },
      { status: 500 },
    );
  }
}
