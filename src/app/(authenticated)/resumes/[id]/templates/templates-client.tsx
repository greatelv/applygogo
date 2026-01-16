"use client";

import { useRouter } from "next/navigation";
import { ResumePreviewPage } from "@/app/components/resume-preview-page";
import { UpgradeModal } from "@/app/components/upgrade-modal";
import { useApp } from "@/app/context/app-context";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const steps = [
  { id: "upload", label: "Upload" },
  { id: "processing", label: "AI Processing" },
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Select Template" },
  { id: "complete", label: "Complete" },
];

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
  const { setWorkflowState } = useApp();
  const { data: session } = useSession();

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
      // Fallback navigation even on error? Or show alert?
      // router.push(`/resumes/${resumeId}`);
      alert("An error occurred while saving the template.");
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
