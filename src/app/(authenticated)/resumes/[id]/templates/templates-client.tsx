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
  personalInfo: any;
  experiences: any[];
  educations: any[];
  skills: any[];
  additionalItems?: any[];
  currentPlan?: "FREE" | "STANDARD" | "PRO";
  initialTemplate?: string;
}

export function TemplatesClient({
  resumeId,
  resumeTitle,
  personalInfo,
  experiences,
  educations,
  skills,
  additionalItems = [],
  currentPlan,
  initialTemplate = "modern",
}: TemplatesClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();

  useEffect(() => {
    setWorkflowState(steps, "preview");

    // Ensure state is TEMPLATE
    fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_step: "TEMPLATE" }),
    }).catch(console.error);

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, resumeId]);

  const handleNext = async (templateId: string) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_step: "COMPLETED",
          selected_template: templateId.toUpperCase(), // Enum is usually uppercase
          status: "COMPLETED",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save template selection");
      }

      router.push(`/resumes/${resumeId}`);
    } catch (error) {
      console.error("Error saving template:", error);
      // Fallback navigation even on error? Or show alert?
      // router.push(`/resumes/${resumeId}`);
      alert("템플릿 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <ResumePreviewPage
      resumeTitle={resumeTitle}
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skills={skills}
      additionalItems={additionalItems}
      currentPlan={currentPlan}
      initialTemplate={initialTemplate}
      onNext={handleNext}
      onBack={() => router.push(`/resumes/${resumeId}/edit`)}
      onUpgrade={() => router.push("/pricing")}
    />
  );
}
