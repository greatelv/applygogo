"use client";

import { useRouter } from "next/navigation";
import { ResumePreviewPage } from "@/app/components/resume-preview-page";
import { useApp } from "@/app/context/app-context";
import { useEffect } from "react";

const steps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

interface TemplatesClientProps {
  resumeId: string;
  resumeTitle: string;
  experiences: any[];
  educations: any[];
  skills: any[];
  currentPlan?: "FREE" | "STANDARD" | "PRO";
}

export function TemplatesClient({
  resumeId,
  resumeTitle,
  experiences,
  educations,
  skills,
  currentPlan,
}: TemplatesClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();

  useEffect(() => {
    setWorkflowState(steps, "preview");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  const handleNext = async (templateId: string) => {
    // TODO: Save selected template to DB via API if needed
    // await fetch(`/api/resumes/${resumeId}`, { method: 'PATCH', body: JSON.stringify({ template: templateId }) });

    // For now, just navigate to completion or dashboard
    router.push(`/resumes/${resumeId}`);
  };

  return (
    <ResumePreviewPage
      resumeTitle={resumeTitle}
      experiences={experiences}
      educations={educations}
      skills={skills}
      currentPlan={currentPlan}
      onNext={handleNext}
      onBack={() => router.back()}
      onUpgrade={() => router.push("/pricing")}
    />
  );
}
