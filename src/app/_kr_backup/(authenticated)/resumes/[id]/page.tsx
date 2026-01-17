import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { DetailClient } from "./detail-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const resume = (await prisma.resume.findUnique({
    where: { id, userId: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additionalItems: { orderBy: { order: "asc" } },
    },
  })) as any;

  if (!resume) notFound();

  // Redirect based on workflow step
  if (resume.current_step === "EDIT") {
    redirect(`/resumes/${resume.id}/edit`);
  } else if (resume.current_step === "TEMPLATE") {
    redirect(`/resumes/${resume.id}/templates`);
  } else if (resume.current_step === "PROCESSING") {
    redirect(`/resumes/${resume.id}/processing`);
  } else if (resume.current_step === "UPLOAD") {
    redirect(`/resumes/new`);
  }

  const mappedExperiences = resume.work_experiences.map((exp) => ({
    id: exp.id,
    company: exp.company_name_kr,
    companyEn: exp.company_name_en || exp.company_name_kr,
    position: exp.role_kr,
    positionEn: exp.role_en || exp.role_kr,
    period: `${exp.start_date} - ${exp.end_date}`,
    bullets: (exp.bullets_kr as string[]) || [],
    bulletsEn: (exp.bullets_en as string[]) || [],
  }));

  const mappedPersonalInfo = {
    name_kr: resume.name_kr || "",
    name_en: resume.name_en || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as any[]) || [],
    summary: resume.summary || "",
  };

  const mappedEducations = resume.educations.map((edu) => ({
    id: edu.id,
    school_name: edu.school_name,
    school_name_en: edu.school_name_en,
    major: edu.major,
    major_en: edu.major_en,
    degree: edu.degree,
    degree_en: edu.degree_en,
    start_date: edu.start_date,
    end_date: edu.end_date,
  }));

  const mappedSkills = resume.skills.map((s) => ({
    id: s.id,
    name: s.name,
    level: s.level,
  }));

  const mappedAdditionalItems = resume.additionalItems.map((item) => ({
    id: item.id,
    type: item.type,
    name: item.name_kr,
    name_en: item.name_en || item.name_kr,
    description: item.description_kr || "",
    description_en: item.description_en || "",
    date: item.date || "",
    order: item.order,
  }));

  return (
    <DetailClient
      resumeId={resume.id}
      resumeTitle={resume.title}
      personalInfo={mappedPersonalInfo}
      experiences={mappedExperiences}
      educations={mappedEducations}
      skills={mappedSkills}
      additionalItems={mappedAdditionalItems}
      template={resume.selected_template?.toLowerCase() || "modern"}
      updatedAt={resume.updated_at.toISOString()}
      isWorkflowComplete={resume.current_step === "COMPLETED"}
    />
  );
}
