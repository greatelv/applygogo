"use client";

import { useRouter } from "@/i18n/routing";
import { ResumePreviewPage } from "@/app/components/resume-preview-page";
import { UpgradeModal } from "@/app/components/upgrade-modal";
import { useApp } from "@/app/context/app-context";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface TemplatesClientProps {
  resumeId: string;
  resumeTitle: string;
  personalInfo: any;
  experiences: any[];
  educations: any[];
  skills: any[];
  additionalItems?: any[];
  currentPlan?: string;
  initialTemplate?: string;
  portoneConfig: {
    storeId: string;
    channelKey: string;
  };
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
  portoneConfig,
}: TemplatesClientProps) {
  const router = useRouter();
  const t = useTranslations();
  const { setWorkflowState } = useApp();
  const { data: session } = useSession();

  const steps = [
    { id: "upload", label: t("workflow.upload") },
    { id: "processing", label: t("workflow.processing") },
    { id: "edit", label: t("workflow.edit") },
    { id: "preview", label: t("workflow.template") },
    { id: "complete", label: t("workflow.complete") },
  ];

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

  const [isCompleting, setIsCompleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleNext = async (templateId: string) => {
    if (isCompleting) return;
    setIsCompleting(true);

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
      alert(t("templatesPage.saveError"));
      setIsCompleting(false);
    }
  };

  return (
    <>
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
        isCompleting={isCompleting}
        onBack={() => router.push(`/resumes/${resumeId}/edit`)}
        onUpgrade={() => setShowUpgradeModal(true)}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        userId={session?.user?.id || ""}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        portoneConfig={portoneConfig}
      />
    </>
  );
}
