"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewResumePage } from "./new-resume-page";
import { ProcessingPage } from "./processing-page";
import { ResumeEditPage } from "./resume-edit-page";
import { ResumePreviewPage } from "./resume-preview-page";
import { ResumeDetailPage } from "./resume-detail-page";
import { useApp } from "../context/app-context";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

interface TranslatedExperience extends Experience {
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

export const createSteps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

const editSteps = [
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

interface ResumeWizardProps {
  initialMode?: "create" | "edit";
  initialData?: {
    id?: string;
    title: string;
    experiences: TranslatedExperience[];
    template?: string;
  };
}

export function ResumeWizard({
  initialMode = "create",
  initialData,
}: ResumeWizardProps) {
  const router = useRouter();
  const { setWorkflowState, quota, setQuota, plan } = useApp();

  const [step, setStep] = useState<
    "upload" | "processing" | "edit" | "preview"
  >(initialMode === "edit" ? "edit" : "upload");

  const [resumeTitle, setResumeTitle] = useState(initialData?.title || "");
  const [experiences, setExperiences] = useState<TranslatedExperience[]>(
    initialData?.experiences || []
  );
  const [template, setTemplate] = useState(initialData?.template || "modern");

  // Always use the full 5 steps for consistency
  const steps = createSteps;

  // Sync with global header stepper
  useEffect(() => {
    setWorkflowState(steps, step);
    return () => setWorkflowState(undefined, undefined);
  }, [step, setWorkflowState, steps]);

  const handleUpload = (file: File) => {
    setResumeTitle(file.name);
    setStep("processing");
  };

  const handleProcessingComplete = () => {
    if (quota > 0) {
      setQuota(quota - 1);
    }
    setStep("edit");
  };

  const handleEditNext = (data: TranslatedExperience[]) => {
    setExperiences(data as any);
    setStep("preview");
  };

  const handlePreviewNext = (templateId: string) => {
    setTemplate(templateId);

    // Save data to sessionStorage to preserve it across redirect (decoupled from React state)
    // Save data to sessionStorage to preserve it across redirect (decoupled from React state)
    const tempData = {
      id: initialData?.id || "new-1", // Use existing ID or mock new one
      title: resumeTitle,
      experiences: experiences,
      template: templateId,
      updatedAt: new Date().toISOString(),
      status: "COMPLETED",
      isJustCompleted: true, // Flag to show success banner
    };
    sessionStorage.setItem("tempResumeData", JSON.stringify(tempData));

    // Advance to complete step instead of redirecting immediately
    setStep("complete");
  };

  if (step === "upload") {
    return <NewResumePage onUpload={handleUpload} />;
  }

  if (step === "processing") {
    return (
      <ProcessingPage
        resumeTitle={resumeTitle}
        onComplete={handleProcessingComplete}
      />
    );
  }

  if (step === "edit") {
    return (
      <ResumeEditPage
        resumeTitle={resumeTitle}
        initialExperiences={initialMode === "edit" ? experiences : undefined}
        isEditingExisting={initialMode === "edit"}
        quota={quota}
        onNext={handleEditNext}
        onBack={() => {
          if (initialMode === "edit") {
            router.back();
          } else {
            setStep("upload");
          }
        }}
        onRetranslate={() => alert("재번역 기능 (Prototype)")}
      />
    );
  }

  if (step === "preview") {
    return (
      <ResumePreviewPage
        resumeTitle={resumeTitle}
        experiences={experiences}
        currentPlan={plan}
        onNext={handlePreviewNext}
        onBack={() => setStep("edit")}
        onUpgrade={() => router.push("/billing")}
      />
    );
  }

  if (step === "complete") {
    return (
      <ResumeDetailPage
        resumeId={initialData?.id || "1"}
        resumeTitle={resumeTitle}
        experiences={experiences}
        template={template}
        isWorkflowComplete={true}
        onBack={() => router.push("/resumes")}
        onDelete={() => router.push("/resumes")}
        onEdit={() => setStep("edit")} // Optional: Allow re-editing from complete step within wizard
      />
    );
  }

  return null;
}
