"use client";

import { useRouter } from "next/navigation";
import { ResumeDetailPage } from "@/app/components/resume-detail-page";
import { useApp } from "@/app/context/app-context";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface DetailClientProps {
  resumeId: string;
  resumeTitle: string;
  personalInfo: any;
  experiences: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
  template: string;
  updatedAt?: string;
  isWorkflowComplete?: boolean;
  locale?: string;
}

export function DetailClient({
  resumeId,
  resumeTitle,
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
  template,
  updatedAt,
  isWorkflowComplete,
  locale,
}: DetailClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();
  const t = useTranslations();

  // Show stepper as "Complete" when viewing detail page
  useEffect(() => {
    const steps = [
      { id: "upload", label: t("common.workflow.upload") },
      { id: "processing", label: t("common.workflow.processing") },
      { id: "edit", label: t("common.workflow.edit") },
      { id: "preview", label: t("common.workflow.template") },
      { id: "complete", label: t("common.workflow.complete") },
    ];
    setWorkflowState(steps, "complete");

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, t]);

  return (
    <ResumeDetailPage
      resumeId={resumeId}
      resumeTitle={resumeTitle}
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skills={skills}
      additionalItems={additionalItems}
      template={template}
      updatedAt={updatedAt}
      isWorkflowComplete={isWorkflowComplete}
      locale={locale}
      onBack={() => {
        router.push("/resumes");
      }}
      onEdit={() => router.push(`/resumes/${resumeId}/edit`)}
      onChangeTemplate={() => router.push(`/resumes/${resumeId}/templates`)}
      onDelete={async (id) => {
        try {
          const res = await fetch(`/api/resumes/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(
              data.error || t("resumeDetail.notifications.deleteError"),
            );
          }

          router.push("/resumes");
          router.refresh();
        } catch (error: any) {
          console.error("Delete error:", error);
          alert(error.message);
        }
      }}
    />
  );
}
