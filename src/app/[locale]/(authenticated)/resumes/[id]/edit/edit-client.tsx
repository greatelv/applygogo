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
        (exp: any) => exp.company?.trim() || exp.position?.trim(),
      );
      const filteredEducations = data.educations.filter((edu: any) =>
        edu.school_name?.trim(),
      );
      const filteredSkills = data.skills.filter((skill: any) =>
        skill.name?.trim(),
      );
      const filteredAdditionalItems = (data.additionalItems || []).filter(
        (item: any) => item.name_kr?.trim() || item.description_kr?.trim(),
      );

      // Map frontend data structure back to DB structure
      const payload = {
        name_kr: data.personalInfo.name_kr,
        name_en: data.personalInfo.name_en,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        links: data.personalInfo.links,
        summary: data.personalInfo.summary,
        summary_kr: data.personalInfo.summary_kr,
        work_experiences: filteredExperiences.map((exp: any) => ({
          company_name_kr: exp.company,
          company_name_en: exp.companyEn,
          role_kr: exp.position,
          role_en: exp.positionEn,
          start_date: exp.period.split(" - ")[0] || "",
          end_date: exp.period.split(" - ")[1] || "",
          bullets_kr: exp.bullets.filter((b: string) => b?.trim()),
          bullets_en: exp.bulletsEn.filter((b: string) => b?.trim()),
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
