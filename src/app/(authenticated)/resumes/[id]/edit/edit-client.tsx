"use client";

import { useRouter } from "next/navigation";
import { ResumeEditPage } from "@/app/components/resume-edit-page";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/app-context";

interface EditClientProps {
  resumeId: string;
  resumeTitle: string;
  initialExperiences: any[];
  initialEducations: any[];
  initialSkills: any[];
  initialCertifications?: any[];
  initialAwards?: any[];
  initialLanguages?: any[];
  initialAdditionalItems?: any[];
  initialPersonalInfo: any;
  sourceLang?: string;
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
  sourceLang,
}: EditClientProps) {
  const router = useRouter();
  const steps = [
    { id: "upload", label: "Upload" },
    { id: "processing", label: "AI Processing" },
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" },
    { id: "complete", label: "Complete" },
  ];

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
        (exp) => exp.company?.trim() || exp.position?.trim()
      );
      const filteredEducations = data.educations.filter((edu) =>
        edu.school_name?.trim()
      );
      const filteredSkills = data.skills.filter((skill) => skill.name?.trim());
      const filteredAdditionalItems = (data.additionalItems || []).filter(
        (item) =>
          item.name_original?.trim() || item.description_original?.trim()
      );

      // Map frontend data structure back to DB structure
      const payload = {
        name_original: data.personalInfo.name_original,
        name_translated: data.personalInfo.name_translated,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        links: data.personalInfo.links,
        summary_translated: data.personalInfo.summary,
        summary_original: data.personalInfo.summary_original,
        work_experiences: filteredExperiences.map((exp) => ({
          company_name_original: exp.company,
          company_name_translated: exp.companyTranslated,
          role_original: exp.position,
          role_translated: exp.positionTranslated,
          start_date: exp.period.split(" - ")[0] || "",
          end_date: exp.period.split(" - ")[1] || "",
          bullets_original: exp.bullets.filter((b: string) => b?.trim()),
          bullets_translated: exp.bulletsTranslated.filter((b: string) =>
            b?.trim()
          ),
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
      alert("An error occurred while saving your resume.");
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
      sourceLang={sourceLang}
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
