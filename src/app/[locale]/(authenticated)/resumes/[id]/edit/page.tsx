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

  // Data Mapping for UI Component (Unified UI Strategy)
  // Left Column (Source) -> company/name_kr inputs
  // Right Column (Target) -> companyEn/name_en inputs
  const isGlobal = locale === "en" || locale === "ja";
  const sourceSuffix =
    locale === "en" ? "_en" : locale === "ja" ? "_ja" : "_kr";
  // Target is always KR for global, EN for KR
  const targetSuffix = isGlobal ? "_kr" : "_en";

  const mappedExperiences = resume.work_experiences.map((exp: any) => {
    const start = clean(exp.start_date);
    const end = clean(exp.end_date);
    const period = !start && !end ? "" : `${start} - ${end}`;

    // Dynamic property access based on locale
    const sourceCompany = exp[`company_name${sourceSuffix}`];
    const targetCompany = exp[`company_name${targetSuffix}`];
    const sourceRole = exp[`role${sourceSuffix}`];
    const targetRole = exp[`role${targetSuffix}`];
    const sourceBullets = exp[`bullets${sourceSuffix}`];
    const targetBullets = exp[`bullets${targetSuffix}`];

    return {
      id: exp.id,
      company: clean(sourceCompany), // Maps to Left UI
      companyEn: clean(targetCompany) || clean(sourceCompany), // Maps to Right UI
      position: clean(sourceRole),
      positionEn: clean(targetRole) || clean(sourceRole),
      period,
      bullets: ((sourceBullets as string[]) || []).map(clean),
      bulletsEn: ((targetBullets as string[]) || []).map(clean),
    };
  });

  const mappedEducations = resume.educations.map((edu: any) => {
    // Education columns are strictly named, need careful mapping
    // En/Ja columns: school_name_[suffix], major_[suffix], degree_[suffix]
    const getCol = (base: string, suffix: string) =>
      edu[`${base}${suffix}`] ||
      edu[base]; /* fallback for base names like school_name */

    // For KR (default), suffix is empty string for base columns like school_name
    // But schema has school_name (KR), school_name_en (EN), school_name_ja (JA)
    // So for KR: Source = school_name, Target = school_name_en

    let sourceSchool,
      targetSchool,
      sourceMajor,
      targetMajor,
      sourceDegree,
      targetDegree;

    if (locale === "ja") {
      sourceSchool = edu.school_name_ja;
      targetSchool = edu.school_name; // KR is in base col
      sourceMajor = edu.major_ja;
      targetMajor = edu.major;
      sourceDegree = edu.degree_ja;
      targetDegree = edu.degree;
    } else if (locale === "en") {
      sourceSchool = edu.school_name_en;
      targetSchool = edu.school_name;
      sourceMajor = edu.major_en;
      targetMajor = edu.major;
      sourceDegree = edu.degree_en;
      targetDegree = edu.degree;
    } else {
      // ko
      sourceSchool = edu.school_name;
      targetSchool = edu.school_name_en;
      sourceMajor = edu.major;
      targetMajor = edu.major_en;
      sourceDegree = edu.degree;
      targetDegree = edu.degree_en;
    }

    return {
      id: edu.id,
      school_name: clean(sourceSchool),
      school_name_en: clean(targetSchool),
      major: clean(sourceMajor),
      major_en: clean(targetMajor),
      degree: clean(sourceDegree),
      degree_en: clean(targetDegree),
      start_date: clean(edu.start_date),
      end_date: clean(edu.end_date),
    };
  });

  const mappedSkills = resume.skills.map((s: any) => ({
    id: s.id,
    name: clean(s.name),
    level: clean(s.level),
  }));

  const mappedAdditionalItems = resume.additional_items.map((item: any) => {
    const sourceName = item[`name${sourceSuffix}`];
    const targetName = item[`name${targetSuffix}`];
    const sourceDesc = item[`description${sourceSuffix}`];
    const targetDesc = item[`description${targetSuffix}`];

    return {
      id: item.id,
      type: item.type,
      name_kr: clean(sourceName), // Maps to Source UI
      name_en: clean(targetName) || clean(sourceName), // Maps to Target UI
      description_kr: clean(sourceDesc),
      description_en: clean(targetDesc),
      date: clean(item.date),
    };
  });

  // Personal Info Mapping
  const sourceName = resume[`name${sourceSuffix}`];
  const targetName = resume[`name${targetSuffix}`];
  // Assuming simpler summary mapping for now until summary_ja is fully confirmed in schema
  // For safety, we use summary (EN/Target for KR) and summary_kr (KR/Source for EN/JA fallback?)
  const pSourceSum =
    locale === "ja"
      ? resume.summary_ja
      : locale === "en"
        ? resume.summary
        : resume.summary_kr;
  const pTargetSum = locale === "ja" ? resume.summary_kr : resume.summary_kr;

  const initialPersonalInfo = {
    name_kr: clean(sourceName), // Maps to name_kr field in UI (Left/Source)
    name_en: clean(targetName), // Maps to name_en field in UI (Right/Target)
    email: clean(resume.email),
    phone: clean(resume.phone),
    links: ((resume.links as any[]) || []).map((link: any) => ({
      label: clean(link.label),
      url: clean(link.url),
    })),
    summary_kr: clean(pSourceSum), // Maps to summary_kr field in UI (Left/Source)
    summary: clean(pTargetSum) || clean(resume.summary), // Maps to summary field in UI (Right/Target)
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
