import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
      include: {
        work_experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        additionalItems: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error: any) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const body = await request.json();
    const {
      name_original,
      name_translated,
      email,
      phone,
      links,
      summary_original,
      summary_translated,
      work_experiences,
      educations,
      skills,
      additional_items,
    } = body;

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Transaction: Delete existing -> Create new -> Update metadata
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing child records
      await tx.workExperience.deleteMany({ where: { resumeId } });
      await tx.education.deleteMany({ where: { resumeId } });
      await tx.skill.deleteMany({ where: { resumeId } });
      await tx.additionalItem.deleteMany({ where: { resumeId } });

      // 2. Create new work experiences
      if (work_experiences?.length > 0) {
        await tx.workExperience.createMany({
          data: work_experiences.map((exp: any, index: number) => ({
            resumeId,
            company_name_original: exp.company_name_original,
            company_name_translated: exp.company_name_translated,
            role_original: exp.role_original,
            role_translated: exp.role_translated,
            start_date: exp.start_date,
            end_date: exp.end_date,
            bullets_original: exp.bullets_original,
            bullets_translated: exp.bullets_translated,
            order: index,
          })),
        });
      }

      // 3. Create new educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            resumeId,
            school_name_original: edu.school_name,
            school_name_translated: edu.school_name_translated,
            major_original: edu.major,
            major_translated: edu.major_translated,
            degree_original: edu.degree,
            degree_translated: edu.degree_translated,
            start_date: edu.start_date,
            end_date: edu.end_date,
            order: index,
          })),
        });
      }

      // 4. Create new skills
      if (skills?.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any, index: number) => ({
            resumeId,
            name: skill.name,
            level: skill.level,
            order: index,
          })),
        });
      }

      // 5. Update resume metadata
      await tx.resume.update({
        where: { id: resumeId },
        data: {
          name_original,
          name_translated,
          email,
          phone,
          links,
          summary_original,
          summary_translated,
          current_step: body.current_step || "TEMPLATE",
          updated_at: new Date(),
        },
      });

      // Additional Items (Certifications, Awards, Languages, etc.)
      if (additional_items && additional_items.length > 0) {
        await tx.additionalItem.createMany({
          data: additional_items.map((item: any, index: number) => ({
            resumeId,
            type: item.type,
            name_original: item.name_original,
            name_translated: item.name_translated,
            description_original: item.description_original,
            description_translated: item.description_translated,
            date: item.date,
            order: index,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const body = await request.json();
    const { current_step, selected_template, status } = body;

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        ...(current_step && { current_step }),
        ...(selected_template && { selected_template }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error: any) {
    console.error("Error patching resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;

    // 1. Get resume to check for file
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 2. Delete file from Storage if exists
    if (resume.original_file_url) {
      try {
        const bucketName =
          process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";
        const { error: storageError } = await getSupabaseAdmin()
          .storage.from(bucketName)
          .remove([resume.original_file_url]);

        if (storageError) {
          console.error("Supabase storage delete error:", storageError);
        } else {
          console.log("Deleted file from storage:", resume.original_file_url);
        }
      } catch (err) {
        console.error("Unexpected error deleting from storage:", err);
      }
    }

    // 3. Delete resume record from DB
    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}
