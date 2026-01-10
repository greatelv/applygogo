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
    const {
      name_kr,
      name_en,
      email,
      phone,
      links,
      summary,
      summary_kr,
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
          name_kr,
          name_en,
          email,
          phone,
          links,
          summary,
          summary_kr,
          current_step: body.current_step || "TEMPLATE",
          updated_at: new Date(),
        },
      });

      // Certifications
      await tx.certification.deleteMany({ where: { resumeId } });
      if (body.certifications && body.certifications.length > 0) {
        await tx.certification.createMany({
          data: body.certifications.map((cert: any) => ({
            resumeId,
            name: cert.name,
            name_en: cert.name_en,
            issuer: cert.issuer,
            issuer_en: cert.issuer_en,
            date: cert.date,
          })),
        });
      }

      // Awards
      await tx.award.deleteMany({ where: { resumeId } });
      if (body.awards && body.awards.length > 0) {
        await tx.award.createMany({
          data: body.awards.map((award: any) => ({
            resumeId,
            name: award.name,
            name_en: award.name_en,
            issuer: award.issuer,
            issuer_en: award.issuer_en,
            date: award.date,
          })),
        });
      }

      // Languages
      await tx.language.deleteMany({ where: { resumeId } });
      if (body.languages && body.languages.length > 0) {
        await tx.language.createMany({
          data: body.languages.map((lang: any) => ({
            resumeId,
            name: lang.name,
            name_en: lang.name_en,
            level: lang.level,
            score: lang.score,
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

    // Verify ownership and delete
    // Prisma cascade delete should handle child records if configured in schema
    const deletedResume = await prisma.resume.deleteMany({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    });

    if (deletedResume.count === 0) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

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
