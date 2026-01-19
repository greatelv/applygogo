import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { EditClient } from "./edit-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const session = await auth();
  const { id, locale } = await params;

  if (!session?.user?.id) redirect({ href: "/login", locale });

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

  // Helper to clean extracted data (remove dashes)
  const clean = (val: string | null | undefined) => {
    if (!val) return "";
    const s = val.trim();
    return ["-", "–", "—"].includes(s) ? "" : val;
  };

  const mappedExperiences = resume.work_experiences.map((exp: any) => {
    const start = clean(exp.start_date);
    const end = clean(exp.end_date);

    return {
      id: exp.id,
      company_name_source: clean(exp.company_name_source),
      company_name_target: clean(exp.company_name_target),
      role_source: clean(exp.role_source),
      role_target: clean(exp.role_target),
      start_date: start,
      end_date: end,
      bullets_source: ((exp.bullets_source as string[]) || []).map(clean),
      bullets_target: ((exp.bullets_target as string[]) || []).map(clean),
    };
  });

  const mappedEducations = resume.educations.map((edu: any) => {
    return {
      id: edu.id,
      school_name_source: clean(edu.school_name_source),
      school_name_target: clean(edu.school_name_target),
      major_source: clean(edu.major_source),
      major_target: clean(edu.major_target),
      degree_source: clean(edu.degree_source),
      degree_target: clean(edu.degree_target),
      start_date: clean(edu.start_date),
      end_date: clean(edu.end_date),
    };
  });

  const mappedSkills = resume.skills.map((s: any) => ({
    id: s.id,
    name: clean(s.name),
    name_source: clean(s.name_source) || clean(s.name),
    name_target: clean(s.name_target) || clean(s.name),
    level: clean(s.level),
  }));

  const mappedAdditionalItems = resume.additional_items.map((item: any) => {
    return {
      id: item.id,
      type: item.type,
      name_source: clean(item.name_source),
      name_target: clean(item.name_target),
      description_source: clean(item.description_source),
      description_target: clean(item.description_target),
      date: clean(item.date),
    };
  });

  // Personal Info Mapping
  const initialPersonalInfo = {
    name_source: clean(resume.name_source),
    name_target: clean(resume.name_target),
    email: clean(resume.email),
    phone: clean(resume.phone),
    links: ((resume.links as any[]) || []).map((link: any) => ({
      label: clean(link.label),
      url: clean(link.url),
    })),
    summary_source: clean(resume.summary_source),
    summary_target: clean(resume.summary_target),
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
