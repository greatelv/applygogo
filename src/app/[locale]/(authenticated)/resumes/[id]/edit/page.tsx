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

  const mappedAdditionalItems = resume.additionalItems.map((item: any) => {
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
  const sourceSummary = resume[`summary${sourceSuffix}`] || resume.summary; // summary matches summary_kr usually? No schema has summary and summary_kr
  // Schema: summary (default?), summary_kr.
  // Wait, schema says: summary String? @default(""), summary_kr String? @default("")
  // Usually summary is English context?
  // Let's check schema again.
  // summary_kr @default(""), name_en, name_kr.
  // summary (un-suffixed) is likely English or "Main".

  let pSourceSum, pTargetSum;
  if (isGlobal) {
    // Source = EN/JA, Target = KR
    // Schema has summary (EN usually) and summary_kr (KR)
    // But wait, if locale is 'ja', do we have summary_ja? NO.
    // We didn't add summary_ja column in schema?
    // I MISSED summary_ja in schema update?
    // Let's check schema update step.
    // Step 94/96 -> I did NOT add summary_ja.
    // I only added _ja for work/edu/additional.
    // Resume model: name_en, name_kr, phone, summary, summary_kr.
    // I missed name_ja and summary_ja?
    // Plan said "Additionally... name_ja, description_ja" for AdditionalItem.
    // Did Plan say name_ja for Resume?
    // Plan: "WorkExperience... Education... AdditionalItem..."
    // It missed Resume model fields!
    // This is an issue.
    // "User Review Required" -> "DB Schema 변경... Resume 모델에 locale 필드... 일본어 지원을 위한 _ja 컬럼 추가... WorkExperience... Education... AdditionalItem".
    // I forgot Resume-level fields (name, summary).
    // However, maybe I can reuse `name_en` for "Foreign Name" and `summary` for "Foreign Summary"?
    // Safe approach: Add name_ja and summary_ja?
    // Or reuse.
    // User said "DB의 경우는 기존 컬럼명이 en과 ja를 담기에 좀 어색하지 않아?" -> I said I will add _ja.
    // So I SHOULD have added name_ja and summary_ja.
    // I missed them.
    // I should add them now.
    // For now, let's proceed with mapping assuming I will add them or reuse.
    // If I reuse `name_en` for JA, it violates "Safe" principle.
    // I MUST add them.
    // I will pause editing `page.tsx` and run another migration?
    // Or... `summary` field is often used as "English Summary".
    // And `summary_kr` is Korean.
    // If I have `summary_ja`, it's clear.
    // Let's finish the mapping logic assuming `summary_ja` exists (or I handle it).
    // Actually, I can leave `summary` as "Main Summary (Target for KR, Source for EN)"?
    // No, `ko` -> `summary_kr` (Source), `summary` (Target/EN).
    // `en` -> `summary_en` (Wait, `summary` is EN). Source=summary, Target=summary_kr.
    // `ja` -> `summary_ja` (Source), `summary_kr` (Target/KR).
    // I definitely need `summary_ja` and `name_ja`.
    // I will halt this edit, run migration for `name_ja` and `summary_ja`, then continue.
    // Wait, I can't return from `replace_file_content` with "Halt".
    // I will use a placeholder mapping for them or just use `summary` for now and fix later.
    // "Existing Service Influence" -> Minimal.
    // If I map `summary` for JA, it overwrites EN summary?
    // Yes. So I need `summary_ja`.
    // I will ABORT this edit by returning original content?
    // No, I can't easily abort.
    // I will make the edit to use `summary` (EN) as temporary holder for JA if I must, but that's bad.
    // Correct path: DO NOT APPLY this edit yet.
    // I will run migration first.
    // BUT `replace_file_content` is being constructed now.
    // I should just error out or write the code assuming the columns exist and then immediately run migration.
    // That's cleaner. Code first, then DB.
    // So I will assume `name_ja` and `summary_ja` exist in Resume model.
    // AND `address_ja`? No address generic.
    // `title`? Title is internal.
    // Resume model has `name_en`, `name_kr`.
    // `summary`, `summary_kr`.
    // I will map:
    // ja: name_ja (Source), name_kr (Target)
    // ja: summary_ja (Source), summary_kr (Target)
    // I will write this code.
  }

  // Re-evaluating. I can't assume they exist because TS will fail during build if not generated.
  // But strictly `page.tsx` uses `any` casting for `resume` object in the provided code!
  // `const resume = (await prisma.resume.findUnique({...})) as any;`
  // So TS won't complain about missing properties on `resume` object.
  // So I can write the code assuming they exist.
  // Then I will run migration.

  if (locale === "ja") {
    pSourceSum = resume.summary_ja;
    pTargetSum = resume.summary_kr;
    // name
  } else if (locale === "en") {
    pSourceSum = resume.summary; // EN default
    pTargetSum = resume.summary_kr;
  } else {
    pSourceSum = resume.summary_kr;
    pTargetSum = resume.summary;
  }

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
    summary: clean(pTargetSum), // Maps to summary field in UI (Right/Target)
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
