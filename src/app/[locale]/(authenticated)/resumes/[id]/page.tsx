import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { DetailClient } from "./detail-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const session = await auth();

  const resume = (await prisma.resume.findUnique({
    where: { id, user_id: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additional_items: { orderBy: { order: "asc" } },
    },
  })) as any;

  if (!resume) notFound();

  // Redirect based on workflow step
  if (resume.current_step === "EDIT") {
    redirect({ href: `/resumes/${resume.id}/edit`, locale });
  } else if (resume.current_step === "TEMPLATE") {
    redirect({ href: `/resumes/${resume.id}/templates`, locale });
  } else if (resume.current_step === "PROCESSING") {
    redirect({ href: `/resumes/${resume.id}/processing`, locale });
  } else if (resume.current_step === "UPLOAD") {
    redirect({ href: `/resumes/new`, locale });
  }

  const mappedExperiences = resume.work_experiences.map((exp: any) => ({
    id: exp.id,
    company_name_source: exp.company_name_source || "",
    company_name_target: exp.company_name_target || "",
    role_source: exp.role_source || "",
    role_target: exp.role_target || "",
    period: `${exp.start_date} - ${exp.end_date}`,
    bullets_source: (exp.bullets_source as string[]) || [],
    bullets_target: (exp.bullets_target as string[]) || [],
  }));

  const mappedPersonalInfo = {
    name_source: resume.name_source || "",
    name_target: resume.name_target || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as any[]) || [],
    summary_source: resume.summary_source || "",
    summary_target: resume.summary_target || "",
  };

  const mappedEducations = resume.educations.map((edu: any) => ({
    id: edu.id,
    school_name_source: edu.school_name_source || "",
    school_name_target: edu.school_name_target || "",
    major_source: edu.major_source || "",
    major_target: edu.major_target || "",
    degree_source: edu.degree_source || "",
    degree_target: edu.degree_target || "",
    start_date: edu.start_date,
    end_date: edu.end_date,
  }));

  const mappedSkills = resume.skills.map((s: any) => ({
    id: s.id,
    name: s.name,
    name_source: s.name_source,
    name_target: s.name_target,
    level: s.level,
  }));

  const mappedAdditionalItems = resume.additional_items.map((item: any) => ({
    id: item.id,
    type: item.type,
    name_source: item.name_source || "",
    name_target: item.name_target || "",
    description_source: item.description_source || "",
    description_target: item.description_target || "",
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
      locale={locale}
    />
  );
}
