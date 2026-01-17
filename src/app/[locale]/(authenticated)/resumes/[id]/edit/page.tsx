import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ResumeEditClient } from "@/app/components/resume-edit-client";
import { Locale } from "@/lib/i18n-utils";

export default async function GlobalEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resume = await prisma.globalResume.findUnique({
    where: { id, userId: session.user.id },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additionalItems: { orderBy: { order: "asc" } },
    },
  });

  if (!resume) notFound();

  // Redirect based on workflow step (Optional safety check)
  if (
    resume.current_step === "UPLOAD" ||
    resume.current_step === "PROCESSING"
  ) {
    redirect(`/${locale}/resumes/${resume.id}/processing`);
  }

  // Data Mapping for UI
  // Note: Based on global-actions.ts, the AI generated English content is stored in:
  // - Profile: name_translated, summary_translated
  // - Work/Edu: _original fields (company_name_original, etc.)

  const personalInfo = {
    nameOriginal: resume.name_original || "",
    nameTranslated: resume.name_translated || "",
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as any) || [],
    summaryOriginal: resume.summary_original || "",
    summaryTranslated: resume.summary_translated || "",
    location: (resume.links as any)?.location || "",
  };

  const experiences = resume.work_experiences.map((exp) => ({
    id: exp.id,
    companyOriginal: exp.company_name_original || "",
    companyTranslated: exp.company_name_translated || "",
    positionOriginal: exp.role_original || "",
    positionTranslated: exp.role_translated || "",
    startDate: exp.start_date,
    endDate: exp.end_date,
    bulletsOriginal: (exp.bullets_original as string[]) || [],
    bulletsTranslated: (exp.bullets_translated as string[]) || [],
  }));

  const educations = resume.educations.map((edu) => ({
    id: edu.id,
    schoolOriginal: edu.school_name_original || "",
    schoolTranslated: edu.school_name_translated || "",
    degreeOriginal: edu.degree_original || "",
    degreeTranslated: edu.degree_translated || "",
    majorOriginal: edu.major_original || "",
    majorTranslated: edu.major_translated || "",
    startDate: edu.start_date,
    endDate: edu.end_date,
  }));

  const skills = resume.skills.map((s) => ({
    id: s.id,
    name: s.name,
    level: s.level || "Intermediate",
  }));

  return (
    <div className="container py-8 max-w-5xl">
      <ResumeEditClient
        resumeId={resume.id}
        initialData={{
          personalInfo,
          experiences,
          educations,
          skills,
        }}
        locale={locale as Locale}
      />
    </div>
  );
}
