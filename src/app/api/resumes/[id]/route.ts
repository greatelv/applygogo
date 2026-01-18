import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const body = await request.json();
    const {
      name_source,
      name_target,
      email,
      phone,
      links,
      summary,
      summary_source,
      work_experiences,
      educations,
      skills,
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

      // 2. Create new work experiences
      if (work_experiences?.length > 0) {
        await tx.workExperience.createMany({
          data: work_experiences.map((exp: any, index: number) => ({
            resumeId,
            company_name_source: exp.company_name_source || exp.company_name_kr,
            company_name_target: exp.company_name_target || exp.company_name_en,
            role_source: exp.role_source || exp.role_kr,
            role_target: exp.role_target || exp.role_en,
            start_date: exp.start_date,
            end_date: exp.end_date,
            bullets_source: exp.bullets_source || exp.bullets_kr,
            bullets_target: exp.bullets_target || exp.bullets_en,
            order: index,
          })),
        });
      }

      // 3. Create new educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            resumeId,
            school_name_source: edu.school_name_source || edu.school_name,
            school_name_target: edu.school_name_target || edu.school_name_en,
            major_source: edu.major_source || edu.major,
            major_target: edu.major_target || edu.major_en,
            degree_source: edu.degree_source || edu.degree,
            degree_target: edu.degree_target || edu.degree_en,
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
            order: index,
          })),
        });
      }

      // 5. Update resume metadata
      await (tx as any).resume.update({
        where: { id: resumeId },
        data: {
          name_source,
          name_target,
          email,
          phone,
          links,
          summary,
          summary_source,
          current_step: body.current_step || "TEMPLATE",
          updated_at: new Date(),
        },
      });

      // Additional Items (Certifications, Awards, Languages, etc.)
      await (tx as any).additionalItem.deleteMany({ where: { resumeId } });
      if (body.additional_items && body.additional_items.length > 0) {
        await (tx as any).additionalItem.createMany({
          data: body.additional_items.map((item: any, index: number) => ({
            resumeId,
            type: item.type,
            name_source: item.name_source || item.name_kr,
            name_target: item.name_target || item.name_en,
            description_source: item.description_source || item.description_kr,
            description_target: item.description_target || item.description_en,
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
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        const { error: storageError } = await supabaseAdmin.storage
          .from("resumes")
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
      { status: 500 },
    );
  }
}
