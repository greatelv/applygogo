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
  initialPersonalInfo: any;
}

export function EditClient({
  resumeId,
  resumeTitle,
  initialExperiences,
  initialEducations,
  initialSkills,
  initialPersonalInfo,
}: EditClientProps) {
  const router = useRouter();
  const { setWorkflowState } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWorkflowState(steps, "edit");

    // Ensure we are in EDIT step in DB
    fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_step: "EDIT" }),
    }).catch(console.error);

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, resumeId]);

  const handleNext = async (data: {
    personalInfo: any;
    experiences: any[];
    educations: any[];
    skills: any[];
  }) => {
    try {
      setIsSaving(true);

      // Map frontend data structure back to DB structure
      const payload = {
        name_kr: data.personalInfo.name_kr,
        name_en: data.personalInfo.name_en,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        links: data.personalInfo.links,
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
      initialPersonalInfo={initialPersonalInfo}
      initialExperiences={initialExperiences}
      initialEducations={initialEducations}
      initialSkills={initialSkills}
      onNext={(data) => handleNext(data)}
      onBack={() => {
        setIsSaving(true); // Reuse saving state for loading spinner
        router.push("/resumes/new");
      }}
      isEditingExisting={true}
      isLoading={isSaving} // Pass loading state to component
    />
  );
}
