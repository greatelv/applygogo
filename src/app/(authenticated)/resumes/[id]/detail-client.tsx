"use client";

import { useRouter } from "next/navigation";
import { ResumeDetailPage } from "@/app/components/resume-detail-page";
import { useApp } from "@/app/context/app-context";
import { useEffect } from "react";

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
}: DetailClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();

  // Show stepper as "Complete" when viewing detail page
  useEffect(() => {
    const steps = [
      { id: "upload", label: "업로드" },
      { id: "processing", label: "AI 처리" },
      { id: "edit", label: "편집" },
      { id: "preview", label: "템플릿 선택" },
      { id: "complete", label: "완료" },
    ];
    setWorkflowState(steps, "complete");

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

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
            throw new Error(data.error || "이력서 삭제에 실패했습니다.");
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
