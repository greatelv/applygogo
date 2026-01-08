"use client";

import { useRouter } from "next/navigation";
import { ResumeDetailPage } from "@/app/components/resume-detail-page";
import { useApp } from "@/app/context/app-context";
import { useEffect } from "react";

interface DetailClientProps {
  resumeId: string;
  resumeTitle: string;
  experiences: any[];
  template: string;
  isWorkflowComplete?: boolean;
}

export function DetailClient({
  resumeId,
  resumeTitle,
  experiences,
  template,
  isWorkflowComplete,
}: DetailClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();

  // Show stepper as "Complete" when viewing detail page if just completed
  useEffect(() => {
    if (isWorkflowComplete) {
      const steps = [
        { id: "upload", label: "업로드" },
        { id: "processing", label: "AI 처리" },
        { id: "edit", label: "편집" },
        { id: "preview", label: "템플릿 선택" },
        { id: "complete", label: "완료" },
      ];
      setWorkflowState(steps, "complete");
    }
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, isWorkflowComplete]);

  return (
    <ResumeDetailPage
      resumeId={resumeId}
      resumeTitle={resumeTitle}
      experiences={experiences}
      template={template}
      isWorkflowComplete={isWorkflowComplete}
      onBack={() => router.push("/resumes")}
      onEdit={() => router.push(`/resumes/${resumeId}/edit`)}
      onDelete={async (id) => {
        // Implement delete API call here or pass handler
        // For now, just a placeholder or call an action
        console.log("Delete", id);
        // await fetch...
        router.push("/resumes");
      }}
    />
  );
}
