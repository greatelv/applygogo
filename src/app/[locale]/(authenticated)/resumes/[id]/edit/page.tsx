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
      company: clean(exp.company_name_original),
      companyTranslated:
        clean(exp.company_name_translated) || clean(exp.company_name_original),
      position: clean(exp.role_original),
      positionTranslated:
        clean(exp.role_translated) || clean(exp.role_original),
      period,
      bullets: ((exp.bullets_original as string[]) || []).map(clean),
      bulletsTranslated: ((exp.bullets_translated as string[]) || []).map(
        clean
      ),
    };
  });

  const mappedEducations = resume.educations.map((edu) => ({
    id: edu.id,
    school_name: clean(edu.school_name_original),
    school_name_translated: clean(edu.school_name_translated),
    major: clean(edu.major_original),
    major_translated: clean(edu.major_translated),
    degree: clean(edu.degree_original),
    degree_translated: clean(edu.degree_translated),
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
    name_original: clean(item.name_original),
    name_translated: clean(item.name_translated) || clean(item.name_original),
    description_original: clean(item.description_original),
    description_translated: clean(item.description_translated),
    date: clean(item.date),
  }));

  const initialPersonalInfo = {
    name_original: clean(resume.name_original),
    name_translated: clean(resume.name_translated),
    email: clean(resume.email),
    phone: clean(resume.phone),
    links: ((resume.links as any[]) || []).map((link) => ({
      label: clean(link.label),
      url: clean(link.url),
    })),
    summary: clean(resume.summary_translated),
    summary_original: clean(resume.summary_original),
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
      sourceLang={resume.sourceLang}
    />
  );
}
