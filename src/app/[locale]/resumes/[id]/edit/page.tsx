import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { GlobalResumeEditClient } from "@/app/components/global-resume-edit-client";
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
    name: resume.name_translated || resume.name_original,
    email: resume.email || "",
    phone: resume.phone || "",
    links: (resume.links as any) || {},
    summary: resume.summary_translated || "",
    location: (resume.links as any)?.location || "",
  };

  const experiences = resume.work_experiences.map((exp) => ({
    id: exp.id,
    company: exp.company_name_original,
    position: exp.role_original,
    startDate: exp.start_date,
    endDate: exp.end_date,
    bullets: (exp.bullets_original as string[]) || [],
  }));

  const educations = resume.educations.map((edu) => ({
    id: edu.id,
    school: edu.school_name_original,
    degree: edu.degree_original,
    major: edu.major_original,
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
      <GlobalResumeEditClient
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
