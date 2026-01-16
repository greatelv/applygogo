"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ResumeDetailPage } from "@/app/components/resume-detail-page";
import { useApp } from "@/app/context/app-context";

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
  convertedData?: any;
  sourceLang?: string;
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
  convertedData,
  sourceLang,
}: DetailClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();
  const [isGeneratingKo, setIsGeneratingKo] = useState(false);

  // Show stepper as "Complete" when viewing detail page
  useEffect(() => {
    const steps = [
      { id: "upload", label: "Upload" },
      { id: "processing", label: "AI Processing" },
      { id: "edit", label: "Edit" },
      { id: "preview", label: "Template" },
      { id: "complete", label: "Complete" },
    ];
    setWorkflowState(steps, "complete");

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  const handleGenerateKo = async () => {
    try {
      setIsGeneratingKo(true);
      toast.info("국문 이력서 변환을 시작합니다...");

      const res = await fetch(`/api/resumes/${resumeId}/generate-ko`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "변환 실패");
      }

      toast.success("국문 이력서가 생성되었습니다!");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "오류가 발생했습니다.");
    } finally {
      setIsGeneratingKo(false);
    }
  };

  // Global instance - always true
  const isGlobalUser = true;

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
      convertedData={convertedData}
      sourceLang={sourceLang}
      showGenerateKo={isGlobalUser} // Only show for global users
      isGeneratingKo={isGeneratingKo}
      onGenerateKo={handleGenerateKo}
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
