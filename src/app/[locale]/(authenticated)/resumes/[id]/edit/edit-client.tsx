"use client";

import { useRouter } from "@/i18n/routing";
import { ResumeEditPage } from "@/app/components/resume-edit-page";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/app-context";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const { setWorkflowState, quota, setQuota } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { id: "upload", label: t("workflow.upload") },
    { id: "processing", label: t("workflow.processing") },
    { id: "edit", label: t("workflow.edit") },
    { id: "preview", label: t("workflow.template") },
    { id: "complete", label: t("workflow.complete") },
  ];

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
        (exp: any) =>
          exp.company_name_source?.trim() || exp.role_source?.trim(),
      );
      const filteredEducations = data.educations.filter((edu: any) =>
        edu.school_name_source?.trim(),
      );
      const filteredSkills = data.skills.filter((skill: any) =>
        skill.name?.trim(),
      );
      const filteredAdditionalItems = (data.additionalItems || []).filter(
        (item: any) =>
          item.name_source?.trim() || item.description_source?.trim(),
      );

      // Map frontend data structure back to DB structure
      const payload = {
        name_source: data.personalInfo.name_source,
        name_target: data.personalInfo.name_target,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        links: data.personalInfo.links,
        summary_source: data.personalInfo.summary_source,
        summary_target: data.personalInfo.summary_target,
        work_experiences: filteredExperiences.map((exp: any) => ({
          company_name_source: exp.company_name_source,
          company_name_target: exp.company_name_target,
          role_source: exp.role_source,
          role_target: exp.role_target,
          start_date: exp.start_date,
          end_date: exp.end_date,
          bullets_source: exp.bullets_source.filter((b: string) => b?.trim()),
          bullets_target: exp.bullets_target.filter((b: string) => b?.trim()),
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
      alert(t("editor.saveError"));
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
