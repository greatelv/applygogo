"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeEditPage } from "@/app/components/resume-edit-page";
import { Upload, FileText, Filter, Languages, CheckCircle } from "lucide-react";
import { Locale, t } from "@/lib/i18n-utils";

interface Props {
  resumeId: string;
  initialData: {
    personalInfo: any;
    experiences: any[];
    educations: any[];
    skills: any[];
    additionalItems?: any[];
  };
  locale: Locale;
}

export function ResumeEditClient({ resumeId, initialData, locale }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Mapping (Original -> Left, Translated -> Right) ---
  const initialPersonalInfo = {
    ...initialData.personalInfo,
    name_kr: initialData.personalInfo.nameOriginal || "", // Maps to Original (Left)
    name_en: initialData.personalInfo.nameTranslated || "", // Maps to Translated (Right)
    summary_kr: initialData.personalInfo.summaryOriginal || "",
    summary: initialData.personalInfo.summaryTranslated || "",
  };

  const initialExperiences = initialData.experiences.map((exp: any) => ({
    id: exp.id,
    company: exp.companyOriginal || "",
    companyEn: exp.companyTranslated || "",
    position: exp.positionOriginal || "",
    positionEn: exp.positionTranslated || "",
    period: (exp.startDate || "") + (exp.endDate ? ` - ${exp.endDate}` : ""),
    bullets: Array.isArray(exp.bulletsOriginal) ? exp.bulletsOriginal : [],
    bulletsEn: Array.isArray(exp.bulletsTranslated)
      ? exp.bulletsTranslated
      : [],
  }));

  const initialEducations = initialData.educations.map((edu: any) => ({
    id: edu.id,
    school_name: edu.schoolOriginal || "",
    school_name_en: edu.schoolTranslated || "",
    major: edu.majorOriginal || "",
    major_en: edu.majorTranslated || "",
    degree: edu.degreeOriginal || "",
    degree_en: edu.degreeTranslated || "",
    start_date: edu.startDate || "",
    end_date: edu.endDate || "",
  }));

  const initialSkills = initialData.skills.map((skill: any) => ({
    id: skill.id,
    name: skill.name || "",
  }));

  const initialAdditionalItems: any[] = initialData.additionalItems || [];

  // Only render Steps if locale is English (Global), to match KR style
  const steps = [
    {
      id: "upload",
      label: t(locale, "Dashboard.status.upload"),
      icon: Upload,
    },
    {
      id: "processing",
      label: t(locale, "Dashboard.status.processing"),
      icon: FileText,
    },
    {
      id: "edit",
      label: t(locale, "Dashboard.status.edit"),
      icon: Filter,
      active: true,
    },
    {
      id: "preview",
      label: t(locale, "Dashboard.status.template"),
      icon: Languages,
    },
    {
      id: "complete",
      label: t(locale, "Dashboard.status.completed"),
      icon: CheckCircle,
    },
  ];

  const handleNext = async (data: any) => {
    setIsSaving(true);
    try {
      console.log("Saving data:", data);

      // Here we should call a Server Action to update the DB
      // await updateGlobalResumeAction(resumeId, data);
      // For now, simulated
      await new Promise((r) => setTimeout(r, 1000));

      router.push(`/${locale}/resumes/${resumeId}/templates`);
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      {/* Workflow Steps UI (Mimicking Dashboard Layout) */}
      <div className="mb-12">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
          {steps.map((step, index) => {
            const isActive = step.active;
            const isCompleted = index < 2; // Hardcoded definition of past steps

            return (
              <div
                key={step.id}
                className="flex flex-col items-center bg-background px-2"
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center border-2 mb-2 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-background text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  <step.icon className="size-4" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reused ResumeEditor Component in Global Mode */}
      <ResumeEditPage
        resumeId={resumeId}
        resumeTitle="Global Resume"
        initialPersonalInfo={initialPersonalInfo}
        initialExperiences={initialExperiences}
        initialEducations={initialEducations}
        initialSkills={initialSkills}
        initialAdditionalItems={initialAdditionalItems}
        isGlobalMode={false} // Always 2-column layout (Original vs Translated)
        locale={locale}
        onNext={handleNext}
        onBack={() => router.back()}
        isLoading={isSaving}
      />
    </div>
  );
}
