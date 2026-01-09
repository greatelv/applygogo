import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { TemplatesClient } from "./templates-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id, userId: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: true,
      awards: true,
      languages: true,
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!resume) notFound();

  // Determine user plan (Simplified logic)
  const currentPlan =
    resume.user.subscription?.status === "ACTIVE" &&
    resume.user.subscription?.planCode === "PRO"
      ? "PRO"
      : "FREE";

  // Data Mapping
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

  const mappedPersonalInfo = {
    name_kr: resume.name_kr || "",
    name_en: resume.name_en || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as { label: string; url: string }[]) || [],
    summary: resume.summary || "",
  };

  const mappedSkills = resume.skills.map((s) => ({
    id: s.id,
    name: s.name,
    level: s.level,
  }));

  const mappedCertifications = resume.certifications.map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    date: c.date,
  }));

  const mappedAwards = resume.awards.map((a) => ({
    id: a.id,
    name: a.name,
    issuer: a.issuer,
    date: a.date,
  }));

  const mappedLanguages = resume.languages.map((l) => ({
    id: l.id,
    name: l.name,
    level: l.level,
    score: l.score,
  }));

  return (
    <TemplatesClient
      resumeId={resume.id}
      resumeTitle={resume.title}
      personalInfo={mappedPersonalInfo}
      experiences={mappedExperiences}
      educations={mappedEducations}
      skills={mappedSkills}
      certifications={mappedCertifications}
      awards={mappedAwards}
      languages={mappedLanguages}
      currentPlan={currentPlan}
      initialTemplate={resume.selected_template?.toLowerCase() || "modern"}
    />
  );
}
