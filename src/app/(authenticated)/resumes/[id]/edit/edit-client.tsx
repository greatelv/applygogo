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
  initialCertifications?: any[]; // Keep for compatibility if needed, but unused
  initialAwards?: any[];
  initialLanguages?: any[];
  initialAdditionalItems?: any[];
  initialPersonalInfo: any;
}

export function EditClient({
  resumeId,
  resumeTitle,
  initialExperiences,
  initialEducations,
  initialSkills,
  initialCertifications,
  initialAwards,
  initialLanguages,
  initialAdditionalItems,
  initialPersonalInfo,
}: EditClientProps) {
  const router = useRouter();
  const { setWorkflowState, quota, setQuota } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWorkflowState(steps, "edit");

    // Ensure we are in EDIT step in DB
    fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_step: "EDIT" }),
    }).catch(console.error);

    // Fetch latest quota (handles initial deduction update)
    import("@/app/lib/actions").then((mod) => {
      mod.getUserSettings().then((settings) => {
        if (settings && typeof settings.remainingQuota === "number") {
          setQuota(settings.remainingQuota);
        }
      });
    });

    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, resumeId, setQuota]);

  const handleDeductCredit = (amount: number) => {
    setQuota(Math.max(0, quota - amount));
  };

  const handleNext = async (data: {
    personalInfo: any;
    experiences: any[];
    educations: any[];
    skills: any[];
    additionalItems: any[];
  }) => {
    try {
      setIsSaving(true);

      // Filter out empty items before save
      const filteredExperiences = data.experiences.filter(
        (exp) => exp.company_source?.trim() || exp.position_source?.trim(),
      );
      const filteredEducations = data.educations.filter((edu) =>
        edu.school_name_source?.trim(),
      );
      const filteredSkills = data.skills.filter((skill) => skill.name?.trim());
      const filteredAdditionalItems = (data.additionalItems || []).filter(
        (item) => item.name_source?.trim() || item.description_source?.trim(),
      );

      // Map frontend data structure back to DB structure
      const payload = {
        name_source: data.personalInfo.name_source,
        name_target: data.personalInfo.name_target,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        links: data.personalInfo.links,
        summary: data.personalInfo.summary_target, // Map to summary (target)
        summary_source: data.personalInfo.summary_source,
        work_experiences: filteredExperiences.map((exp) => ({
          company_name_source: exp.company_source,
          company_name_target: exp.company_target,
          role_source: exp.position_source,
          role_target: exp.position_target,
          start_date: exp.period.split(" - ")[0] || "",
          end_date: exp.period.split(" - ")[1] || "",
          bullets_source: exp.bullets_source.filter((b: string) => b?.trim()),
          bullets_target:
            exp.bullets_target?.filter((b: string) => b?.trim()) || [],
        })),
        educations: filteredEducations,
        skills: filteredSkills,
        additional_items: filteredAdditionalItems,
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
      resumeId={resumeId}
      resumeTitle={resumeTitle}
      initialPersonalInfo={initialPersonalInfo}
      initialExperiences={initialExperiences}
      initialEducations={initialEducations}
      initialSkills={initialSkills}
      initialAdditionalItems={initialAdditionalItems}
      onNext={handleNext}
      onBack={() => {
        setIsSaving(true);
        router.push("/resumes/new");
      }}
      isEditingExisting={true}
      isLoading={isSaving}
      onDeductCredit={handleDeductCredit}
    />
  );
}
