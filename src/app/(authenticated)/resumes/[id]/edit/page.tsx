import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditClient } from "./edit-client";

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

  // Helper to clean extracted data (remove dashes)
  const clean = (val: string | null | undefined) => {
    if (!val) return "";
    const s = val.trim();
    return ["-", "–", "—"].includes(s) ? "" : val;
  };

  // Data Mapping for UI Component
  const mappedExperiences = resume.work_experiences.map((exp) => {
    const start = clean(exp.start_date);
    const end = clean(exp.end_date);
    const period = !start && !end ? "" : `${start} - ${end}`;

    return {
      id: exp.id,
      company: clean(exp.company_name_kr),
      companyEn: clean(exp.company_name_en) || clean(exp.company_name_kr),
      position: clean(exp.role_kr),
      positionEn: clean(exp.role_en) || clean(exp.role_kr),
      period,
      bullets: ((exp.bullets_kr as string[]) || []).map(clean),
      bulletsEn: ((exp.bullets_en as string[]) || []).map(clean),
    };
  });

  const mappedEducations = resume.educations.map((edu) => ({
    id: edu.id,
    school_name: clean(edu.school_name),
    school_name_en: clean(edu.school_name_en),
    major: clean(edu.major),
    major_en: clean(edu.major_en),
    degree: clean(edu.degree),
    degree_en: clean(edu.degree_en),
    start_date: clean(edu.start_date),
    end_date: clean(edu.end_date),
  }));

  const mappedSkills = resume.skills.map((s) => ({
    id: s.id,
    name: clean(s.name),
    level: clean(s.level),
  }));

  const mappedAdditionalItems = resume.additionalItems.map((item) => ({
    id: item.id,
    type: item.type,
    name_kr: clean(item.name_kr),
    name_en: clean(item.name_en) || clean(item.name_kr),
    description_kr: clean(item.description_kr),
    description_en: clean(item.description_en),
    date: clean(item.date),
  }));

  const initialPersonalInfo = {
    name_kr: clean(resume.name_kr),
    name_en: clean(resume.name_en),
    email: clean(resume.email),
    phone: clean(resume.phone),
    links: ((resume.links as any[]) || []).map((link) => ({
      label: clean(link.label),
      url: clean(link.url),
    })),
    summary: clean(resume.summary),
    summary_kr: clean(resume.summary_kr),
  };

  return (
    <EditClient
      resumeId={resume.id}
      resumeTitle={resume.title}
      initialExperiences={mappedExperiences}
      initialEducations={mappedEducations}
      initialSkills={mappedSkills}
      initialAdditionalItems={mappedAdditionalItems}
      initialPersonalInfo={initialPersonalInfo}
    />
  );
}
