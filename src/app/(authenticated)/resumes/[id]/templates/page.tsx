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

  const resume: any = await prisma.resume.findUnique({
    where: { id, userId: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additionalItems: { orderBy: { order: "asc" } },
      user: {
        select: {
          planType: true,
          planExpiresAt: true,
        },
      },
    },
  });

  if (!resume) notFound();

  // Determine user plan
  const now = new Date();
  const isPaidActive =
    resume.user.planExpiresAt && resume.user.planExpiresAt > now;
  const currentPlan = isPaidActive ? resume.user.planType : "FREE";

  // Data Mapping
  const mappedExperiences = resume.work_experiences.map((exp: any) => ({
    id: exp.id,
    company: exp.company_name_original,
    companyTranslated: exp.company_name_translated || exp.company_name_original,
    position: exp.role_original,
    positionTranslated: exp.role_translated || exp.role_original,
    period: `${exp.start_date} - ${exp.end_date}`,
    bullets: (exp.bullets_original as string[]) || [],
    bulletsTranslated: (exp.bullets_translated as string[]) || [],
  }));

  const mappedEducations = resume.educations.map((edu: any) => ({
    id: edu.id,
    school_name: edu.school_name_original,
    school_name_translated:
      edu.school_name_translated || edu.school_name_original,
    major: edu.major_original,
    major_translated: edu.major_translated || edu.major_original,
    degree: edu.degree_original,
    degree_translated: edu.degree_translated || edu.degree_original,
    start_date: edu.start_date,
    end_date: edu.end_date,
  }));

  const mappedPersonalInfo = {
    name_original: resume.name_original || "",
    name_translated: resume.name_translated || resume.name_original || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as { label: string; url: string }[]) || [],
    summary: resume.summary_translated || resume.summary_original || "",
  };

  const mappedSkills = resume.skills.map((s: any) => ({
    id: s.id,
    name: s.name,
    level: s.level,
  }));

  const mappedAdditionalItems = (resume.additionalItems || []).map(
    (item: any) => ({
      id: item.id,
      type: item.type,
      name_original: item.name_original,
      name_translated: item.name_translated || item.name_original,
      description_original: item.description_original,
      description_translated:
        item.description_translated || item.description_original,
      date: item.date,
    })
  );

  return (
    <TemplatesClient
      resumeId={resume.id}
      resumeTitle={resume.title}
      personalInfo={mappedPersonalInfo}
      experiences={mappedExperiences}
      educations={mappedEducations}
      skills={mappedSkills}
      additionalItems={mappedAdditionalItems}
      currentPlan={currentPlan}
      initialTemplate={resume.selected_template?.toLowerCase() || "modern"}
      portoneConfig={{
        storeId:
          process.env.NEXT_PUBLIC_PORTONE_STORE_ID ||
          process.env.PORTONE_STORE_ID ||
          "",
        channelKey:
          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ||
          process.env.PORTONE_CHANNEL_KEY ||
          "",
      }}
    />
  );
}
