"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { generateGlobalResume } from "@/lib/global-resume-generator";

export async function uploadGlobalResumeAction(
  formData: FormData,
  locale: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Login required");
    }

    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
    }

    // 1. Upload to Supabase Storage
    const sanitizedFileName = file.name
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, "_");
    const filePath = `${session.user.id}/${Date.now()}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(filePath, file, {
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw new Error("Failed to upload file to storage");
    }

    // 2. Create GlobalResume record
    const resume = await prisma.globalResume.create({
      data: {
        user: { connect: { id: session.user.id } },
        title: file.name.replace(".pdf", ""),
        sourceLocale: locale, // 'en', 'ja'
        targetLocale: "en",
        original_file_url: uploadData.path,
        name_original: file.name.replace(".pdf", ""),
        status: "PROCESSING",
        current_step: "PROCESSING",
      },
    });

    revalidatePath(`/${locale}/resumes`);

    return { success: true, resumeId: resume.id };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function processGlobalResumeAction(resumeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // 1. Fetch Resume Record
    const resume = await prisma.globalResume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });
    if (!resume) throw new Error("Resume not found");

    // 2. Download File from Supabase
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.original_file_url);

    if (downloadError || !fileBlob) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    console.log(`[DEBUG] Downloaded PDF Size: ${fileBlob.size} bytes`);

    // 3. Prepare Buffer for Multimodal
    const arrayBuffer = await fileBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    console.log(
      `[DEBUG] Prepared Buffer for Gemini: ${pdfBuffer.length} bytes`,
    );

    // 4. Generate Content with Gemini (Multimodal)
    const targetLocale = resume.sourceLocale === "ja" ? "ja" : "en";
    const generatedData = await generateGlobalResume(pdfBuffer, targetLocale);

    // 5. Save to DB
    await prisma.$transaction(async (tx) => {
      // Clear existing items
      await tx.globalWorkExperience.deleteMany({ where: { resumeId } });
      await tx.globalEducation.deleteMany({ where: { resumeId } });
      await tx.globalSkill.deleteMany({ where: { resumeId } });

      // Update Resume Profile
      await tx.globalResume.update({
        where: { id: resumeId },
        data: {
          name_translated: generatedData.personalInfo.name,
          email: generatedData.personalInfo.email || resume.email,
          phone: generatedData.personalInfo.phone || resume.phone,
          summary_translated: generatedData.summary,
          links: {
            linkedin: generatedData.personalInfo.linkedin,
            website: generatedData.personalInfo.website,
            location: generatedData.personalInfo.location,
          } as any,
          status: "IDLE",
          current_step: "EDIT_TRANSLATION",
        },
      });

      // Save Work Experiences
      if (generatedData.workExperience?.length > 0) {
        await tx.globalWorkExperience.createMany({
          data: generatedData.workExperience.map((exp, i) => ({
            resumeId,
            company_name_original: exp.company,
            role_original: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            bullets_original: exp.highlights, // Stored as Json
            order: i,
          })),
        });
      }

      // Save Education
      if (generatedData.education?.length > 0) {
        await tx.globalEducation.createMany({
          data: generatedData.education.map((edu, i) => ({
            resumeId,
            school_name_original: edu.school,
            degree_original: edu.degree,
            major_original: edu.major || "",
            start_date: edu.startDate || "",
            end_date: edu.endDate,
            order: i,
          })),
        });
      }

      // Save Skills
      if (generatedData.skills?.length > 0) {
        const flatSkills = generatedData.skills.flatMap((cat) =>
          cat.items.map((item) => ({ name: item, category: cat.category })),
        );
        await tx.globalSkill.createMany({
          data: flatSkills.map((skill, i) => ({
            resumeId,
            name: skill.name,
            level: "Intermediate",
            order: i,
          })),
        });
      }
    });

    revalidatePath(`/resumes/${resumeId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Processing Error:", error);
    // Fail gracefully
    await prisma.globalResume.update({
      where: { id: resumeId },
      data: {
        status: "FAILED",
        failure_message: error.message || "Unknown error",
      },
    });
    return { success: false, error: error.message };
  }
}
