"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewResumePage } from "./new-resume-page";
import { ProcessingPage } from "./processing-page";
import { ResumeEditPage } from "./resume-edit-page";
import { ResumePreviewPage } from "./resume-preview-page";
import { ResumeDetailPage } from "./resume-detail-page";
import { useApp } from "@/app/context/app-context";
import {
  uploadResumeAction,
  updateResumeTemplateAction,
  updateResumeAction,
} from "@/app/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

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
    educations?: any[];
    skills?: any[];
    certifications?: any[];
    awards?: any[];
    languages?: any[];
    personalInfo?: any;
    template?: string;
  };
}

export function ResumeWizard({
  initialMode = "create",
  initialData,
}: ResumeWizardProps) {
  const router = useRouter();
  const { setWorkflowState, quota, setQuota, plan } = useApp();

  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<
    "upload" | "processing" | "edit" | "preview" | "complete"
  >(initialMode === "edit" ? "edit" : "upload");

  const [resumeTitle, setResumeTitle] = useState(initialData?.title || "");
  const [experiences, setExperiences] = useState<TranslatedExperience[]>(
    initialData?.experiences || []
  );
  const [educations, setEducations] = useState<any[]>(
    initialData?.educations || []
  );
  const [skills, setSkills] = useState<any[]>(initialData?.skills || []);
  const [certifications, setCertifications] = useState<any[]>(
    initialData?.certifications || []
  );
  const [awards, setAwards] = useState<any[]>(initialData?.awards || []);
  const [languages, setLanguages] = useState<any[]>(
    initialData?.languages || []
  );
  const [personalInfo, setPersonalInfo] = useState<any>(
    initialData?.personalInfo || null
  );
  const [template, setTemplate] = useState(initialData?.template || "modern");
  const [resumeId, setResumeId] = useState<string | null>(
    initialData?.id || null
  );

  // Always use the full 5 steps for consistency
  const steps = createSteps;

  // Sync with global header stepper
  useEffect(() => {
    setWorkflowState(steps, step);
    return () => setWorkflowState(undefined, undefined);
  }, [step, setWorkflowState, steps]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setResumeTitle(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadResumeAction(formData);

      if (result.success && result.resumeId) {
        setResumeId(result.resumeId);
        setStep("processing");
      }
    } catch (error: any) {
      setAlertConfig({
        open: true,
        title: "오류 발생",
        description: error.message || "업로드 중 오류가 발생했습니다.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Loading states for workflow steps
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);

  const handleProcessingComplete = async () => {
    if (isProcessingComplete) return;
    setIsProcessingComplete(true);

    if (quota > 0) {
      setQuota(quota - 1);
    }

    // Fetch analyzed data from DB
    if (resumeId) {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const data = await response.json();

          // Transform DB data to component format
          const transformedExperiences = data.work_experiences.map(
            (exp: any) => ({
              id: exp.id,
              company: exp.company_name_kr,
              companyEn: exp.company_name_en,
              position: exp.role_kr,
              positionEn: exp.role_en,
              period: `${exp.start_date} ~ ${exp.end_date}`,
              bullets: exp.bullets_kr,
              bulletsEn: exp.bullets_en,
            })
          );

          setExperiences(transformedExperiences);
          setEducations(data.educations || []);
          setSkills(data.skills || []);
          setCertifications(data.certifications || []);
          setAwards(data.awards || []);
          setLanguages(data.languages || []);
          setPersonalInfo({
            name_kr: data.name_kr,
            name_en: data.name_en,
            email: data.email,
            phone: data.phone,
            links: (data.links as any[]) || [],
            summary: data.summary || "",
            summary_kr: data.summary_kr || "",
          });

          if (data.selected_template) {
            setTemplate(data.selected_template.toLowerCase());
          }
        }
      } catch (error) {
        console.error("Failed to fetch resume data:", error);
        // On error, we might want to let them try again?
        setIsProcessingComplete(false);
        return;
      }
    }

    setStep("edit");
    setIsProcessingComplete(false);
  };

  const handleEditNext = async (data: {
    personalInfo: any;
    experiences: any[];
    educations: any[];
    skills: any[];
    additionalItems: any[];
  }) => {
    if (isSavingEdits) return;
    setIsSavingEdits(true);

    const { additionalItems, ...rest } = data;

    const certifications = additionalItems.filter(
      (item) => item.type === "CERTIFICATION"
    );
    const awards = additionalItems.filter((item) => item.type === "AWARD");
    const languages = additionalItems.filter(
      (item) => item.type === "LANGUAGE"
    );

    setExperiences(data.experiences as any);
    setEducations(data.educations);
    setSkills(data.skills);
    setCertifications(certifications);
    setAwards(awards);
    setLanguages(languages);
    setPersonalInfo(data.personalInfo);

    if (resumeId) {
      try {
        await updateResumeAction(resumeId, {
          ...rest,
          certifications,
          awards,
          languages,
        });
      } catch (error) {
        console.error("Failed to save resume edits:", error);
        setAlertConfig({
          open: true,
          title: "저장 실패",
          description: "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        });
        setIsSavingEdits(false);
        return;
      }
    }
    setStep("preview");
    setIsSavingEdits(false);
  };

  const [isCompleting, setIsCompleting] = useState(false);

  const handlePreviewNext = async (templateId: string) => {
    if (isCompleting) return;
    setIsCompleting(true);
    setTemplate(templateId);

    // Persist to DB if we have a resumeId
    if (resumeId) {
      const response = await updateResumeTemplateAction(
        resumeId,
        templateId as "modern" | "classic" | "minimal"
      );
      if (!response.success) {
        console.error("Failed to save template selection");
      }
    }

    // Save data to sessionStorage to preserve it across redirect (decoupled from React state)
    const tempData = {
      id: resumeId || initialData?.id || "new-1",
      title: resumeTitle,
      experiences: experiences,
      educations: educations,
      skills: skills,
      template: templateId,
      updatedAt: new Date().toISOString(),
      status: "COMPLETED",
      isJustCompleted: true,
    };
    sessionStorage.setItem("tempResumeData", JSON.stringify(tempData));

    // Advance to complete step instead of redirecting immediately
    setStep("complete");
    setIsCompleting(false);
  };

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    title: "",
    description: "",
  });

  const renderContent = () => {
    if (step === "upload") {
      return (
        <NewResumePage onUpload={handleUpload} isUploading={isUploading} />
      );
    }

    if (step === "processing") {
      return (
        <ProcessingPage
          resumeTitle={resumeTitle}
          resumeId={resumeId}
          onComplete={handleProcessingComplete}
          isCompleting={isProcessingComplete}
        />
      );
    }

    if (step === "edit") {
      return (
        <ResumeEditPage
          resumeId={resumeId}
          resumeTitle={resumeTitle}
          initialPersonalInfo={personalInfo}
          initialExperiences={experiences}
          initialEducations={educations}
          initialSkills={skills}
          initialAdditionalItems={[...certifications, ...awards, ...languages]}
          isEditingExisting={initialMode === "edit"}
          quota={quota}
          isLoading={isSavingEdits}
          onNext={handleEditNext}
          onDeductCredit={(amount) => {
            setQuota((prev) => Math.max(0, prev - amount));
          }}
          onBack={() => {
            if (initialMode === "edit") {
              router.back();
            } else {
              setStep("upload");
            }
          }}
          onRetranslate={() =>
            setAlertConfig({
              open: true,
              title: "알림",
              description: "재번역 기능 (Prototype)",
            })
          }
        />
      );
    }

    if (step === "preview") {
      return (
        <ResumePreviewPage
          resumeTitle={resumeTitle}
          personalInfo={personalInfo}
          experiences={experiences}
          educations={educations}
          skills={skills}
          additionalItems={[...certifications, ...awards, ...languages]}
          currentPlan={plan}
          onNext={handlePreviewNext}
          onBack={() => setStep("edit")}
          onUpgrade={() => router.push("/settings")}
          initialTemplate={template}
          isCompleting={isCompleting}
        />
      );
    }

    if (step === "complete") {
      return (
        <ResumeDetailPage
          resumeId={resumeId || initialData?.id || "1"}
          resumeTitle={resumeTitle}
          personalInfo={personalInfo}
          experiences={experiences}
          educations={educations}
          skills={skills}
          additionalItems={[...certifications, ...awards, ...languages]}
          template={template}
          isWorkflowComplete={true}
          onBack={() => router.push("/resumes")}
          onDelete={() => router.push("/resumes")}
          onEdit={() => setStep("edit")}
          onChangeTemplate={() => setStep("preview")}
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderContent()}
      <AlertDialog
        open={alertConfig.open}
        onOpenChange={(open) => setAlertConfig((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
                setAlertConfig((prev) => ({ ...prev, open: false }))
              }
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
