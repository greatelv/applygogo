import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { TemplatesClient } from "./templates-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const session = await auth();
  const { id, locale } = await params;

  if (!session?.user?.id) redirect({ href: "/login", locale });

  const resume: any = await prisma.resume.findUnique({
    where: { id, user_id: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additional_items: { orderBy: { order: "asc" } },
      user: {
        select: {
          plan_type: true,
          plan_expires_at: true,
        },
      },
    },
  });

  if (!resume) notFound();

  // Determine user plan
  const now = new Date();
  const isPaidActive =
    resume.user.plan_expires_at && resume.user.plan_expires_at > now;
  const currentPlan = isPaidActive ? resume.user.plan_type : "FREE";

  // Data Mapping
  const mappedExperiences = resume.work_experiences.map((exp: any) => ({
    id: exp.id,
    company_name_source: exp.company_name_source,
    company_name_target: exp.company_name_target,
    role_source: exp.role_source,
    role_target: exp.role_target,
    period: `${exp.start_date} - ${exp.end_date}`,
    bullets_source: (exp.bullets_source as string[]) || [],
    bullets_target: (exp.bullets_target as string[]) || [],
  }));

  const mappedEducations = resume.educations.map((edu: any) => ({
    id: edu.id,
    school_name_source: edu.school_name_source,
    school_name_target: edu.school_name_target,
    major_source: edu.major_source,
    major_target: edu.major_target,
    degree_source: edu.degree_source,
    degree_target: edu.degree_target,
    start_date: edu.start_date,
    end_date: edu.end_date,
  }));

  const mappedPersonalInfo = {
    name_source: resume.name_source || "",
    name_target: resume.name_target || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as { label: string; url: string }[]) || [],
    summary_source: resume.summary_source || "",
    summary_target: resume.summary_target || "",
  };

  const mappedSkills = resume.skills.map((s: any) => ({
    id: s.id,
    name: s.name,
    level: s.level,
  }));

  const mappedAdditionalItems = (resume.additional_items || []).map(
    (item: any) => ({
      id: item.id,
      type: item.type,
      name_source: item.name_source,
      name_target: item.name_target,
      description_source: item.description_source,
      description_target: item.description_target,
      date: item.date,
    }),
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
