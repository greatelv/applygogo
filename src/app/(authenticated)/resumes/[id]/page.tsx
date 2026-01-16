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
    company: exp.company_name_original,
    companyTranslated: exp.company_name_translated || exp.company_name_original,
    position: exp.role_original,
    positionTranslated: exp.role_translated || exp.role_original,
    period: `${exp.start_date} - ${exp.end_date}`,
    bullets: (exp.bullets_original as string[]) || [],
    bulletsTranslated: (exp.bullets_translated as string[]) || [],
  }));

  const mappedPersonalInfo = {
    name_original: resume.name_original || "",
    name_translated: resume.name_translated || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as any[]) || [],
    summary: resume.summary_translated || "",
    summary_original: resume.summary_original || "",
  };

  const mappedEducations = resume.educations.map((edu) => ({
    id: edu.id,
    school_name: edu.school_name_original,
    school_name_translated: edu.school_name_translated,
    major: edu.major_original,
    major_translated: edu.major_translated,
    degree: edu.degree_original,
    degree_translated: edu.degree_translated,
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
    name_original: item.name_original,
    name_translated: item.name_translated || item.name_original,
    description_original: item.description_original || "",
    description_translated: item.description_translated || "",
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
      convertedData={resume.convertedData}
      sourceLang={resume.sourceLang}
    />
  );
}
