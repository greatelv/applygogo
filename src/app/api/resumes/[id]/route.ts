import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const { work_experiences, educations, skills } = body;

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
            company_name_kr: exp.company_name_kr,
            company_name_en: exp.company_name_en,
            role_kr: exp.role_kr,
            role_en: exp.role_en,
            start_date: exp.start_date,
            end_date: exp.end_date,
            bullets_kr: exp.bullets_kr,
            bullets_en: exp.bullets_en,
            order: index,
          })),
        });
      }

      // 3. Create new educations
      if (educations?.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu: any, index: number) => ({
            resumeId,
            school_name: edu.school_name,
            school_name_en: edu.school_name_en,
            major: edu.major,
            major_en: edu.major_en,
            degree: edu.degree,
            degree_en: edu.degree_en,
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
      await tx.resume.update({
        where: { id: resumeId },
        data: {
          current_step: "TEMPLATE", // Move to next step logic handled by frontend, but useful to track
          updated_at: new Date(),
        },
      });
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
