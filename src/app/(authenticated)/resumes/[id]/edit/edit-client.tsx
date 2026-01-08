"use client";

import { useRouter } from "next/navigation";
import { ResumeEditPage } from "@/app/components/resume-edit-page";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/app-context";

const steps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

interface EditClientProps {
  resumeId: string;
  resumeTitle: string;
  initialExperiences: any[];
  initialEducations: any[];
  initialSkills: any[];
}

export function EditClient({
  resumeId,
  resumeTitle,
  initialExperiences,
  initialEducations,
  initialSkills,
}: EditClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWorkflowState(steps, "edit");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  const handleNext = async (data: {
    experiences: any[];
    educations: any[];
    skills: any[];
  }) => {
    try {
      setIsSaving(true);

      // Map frontend data structure back to DB structure
      const payload = {
        work_experiences: data.experiences.map((exp) => ({
          company_name_kr: exp.company,
          company_name_en: exp.companyEn,
          role_kr: exp.position,
          role_en: exp.positionEn,
          start_date: exp.period.split(" - ")[0] || "",
          end_date: exp.period.split(" - ")[1] || "",
          bullets_kr: exp.bullets,
          bullets_en: exp.bulletsEn,
        })),
        educations: data.educations,
        skills: data.skills,
      };

      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save resume");
      }

      router.push(`/resumes/${resumeId}/templates`);
    } catch (error) {
      console.error(error);
      alert("이력서 내용을 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResumeEditPage
      resumeTitle={resumeTitle}
      initialExperiences={initialExperiences}
      initialEducations={initialEducations}
      initialSkills={initialSkills}
      onNext={handleNext}
      onBack={() => router.back()} // Or router.push(`/resumes/${resumeId}/processing`)
      isEditingExisting={true} // Always treated as editing data loaded from DB
    />
  );
}
