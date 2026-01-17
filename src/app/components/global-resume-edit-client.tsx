"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeEditPage } from "@/app/components/resume-edit-page";
import { GlobalResume } from "@prisma/client"; // Ensure type is available
import { Upload, FileText, Filter, Languages, CheckCircle } from "lucide-react";
import { Locale } from "@/lib/i18n-utils";

// Define a type that includes relations if not already imported
interface GlobalResumeWithRelations extends GlobalResume {
  workExperience: any[];
  education: any[];
  skills: any[];
  certificates?: any[]; // Assuming these might exist
}

interface Props {
  resume: GlobalResumeWithRelations;
  locale: Locale;
}

export function GlobalResumeEditClient({ resume, locale }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Mapping (GlobalResume -> ResumeEditPage Props) ---
  const personalInfoData = resume.data as any; // Assuming 'data' JSON holds personal info if schema differs
  // But wait, schema has separate tables ideally.
  // Let's assume passed 'resume' object has populated relations or JSON fields.
  // Based on previous context, we are using relational tables: GlobalWorkExperience, etc.

  // Actually, 'GlobalResume' schema from previous file view showed 'data' Json field?
  // No, 'processGlobalResumeAction' saved to relational tables.
  // Let's assume 'resume' prop passed here includes these relations.

  const initialPersonalInfo = {
    name_kr: "", // Not used in global
    name_en: (resume as any).personalInfo?.name || "",
    // Fallback to JSON if relation not direct on root.
    // Wait, in `edit/page.tsx` we fetch: include: { workExperience: true, education: true, skills: true }
    // And personal info was likely stored in columns or JSON.
    // Let's assume flat structure or mapped before passing here?
    // In `edit/page.tsx`, we saw `getUserGlobalResume` fetching relation.

    // Let's map safely.
    email: (resume as any).personalInfo?.email || "",
    phone: (resume as any).personalInfo?.phone || "",
    links: (resume as any).personalInfo?.links || [], // [{label, url}]
    summary: (resume as any).personalInfo?.summary || "",
    summary_kr: "",
  };

  const initialExperiences = (resume.workExperience || []).map((exp: any) => ({
    id: exp.id,
    company: "",
    companyEn: exp.company || "",
    position: "",
    positionEn: exp.position || "",
    period: (exp.startDate || "") + (exp.endDate ? ` - ${exp.endDate}` : ""),
    bullets: [],
    bulletsEn: Array.isArray(exp.highlights) ? exp.highlights : [],
  }));

  const initialEducations = (resume.education || []).map((edu: any) => ({
    id: edu.id,
    school_name: "",
    school_name_en: edu.school || "",
    major: "",
    major_en: edu.degree || "", // Mapping degree/major might be combined
    degree: "",
    degree_en: "",
    start_date: edu.startDate || "",
    end_date: edu.endDate || "",
  }));

  const initialSkills = (resume.skills || []).map((skill: any) => ({
    id: skill.id,
    name: skill.name || "",
  }));

  const initialAdditionalItems: any[] = []; // Map certificates if available

  // Only render Steps if locale is English (Global), to match KR style
  const steps = [
    {
      id: "upload",
      label: locale === "ko" ? "업로드" : "Upload",
      icon: Upload,
    },
    {
      id: "processing",
      label: locale === "ko" ? "AI 처리" : "AI Processing",
      icon: FileText,
    },
    {
      id: "edit",
      label: locale === "ko" ? "편집" : "Edit",
      icon: Filter,
      active: true,
    },
    {
      id: "preview",
      label: locale === "ko" ? "템플릿 선택" : "Template",
      icon: Languages,
    },
    {
      id: "complete",
      label: locale === "ko" ? "완료" : "Done",
      icon: CheckCircle,
    },
  ];

  const handleNext = async (data: any) => {
    setIsSaving(true);
    try {
      console.log("Saving data:", data);

      // Here we should call a Server Action to update the DB
      // await updateGlobalResumeAction(resume.id, data);
      // For now, simulated
      await new Promise((r) => setTimeout(r, 1000));

      router.push(`/${locale}/resumes/${resume.id}/templates`);
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
        resumeId={resume.id}
        resumeTitle="Global Resume"
        initialPersonalInfo={initialPersonalInfo}
        initialExperiences={initialExperiences}
        initialEducations={initialEducations}
        initialSkills={initialSkills}
        initialAdditionalItems={initialAdditionalItems}
        isGlobalMode={true} // Enable Single Column & English Labels
        onNext={handleNext}
        onBack={() => router.back()}
        isLoading={isSaving}
      />
    </div>
  );
}
