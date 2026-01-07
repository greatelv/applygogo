"use client";

import { ResumeDetailPage } from "../../../components/resume-detail-page";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { useApp } from "../../../context/app-context";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params using React 19's use() hook implicitly or explicitly if needed in Next.js 16
  // But Next.js 16/15 treats params as a Promise in Server Components.
  // Since this is a Client Component ("use client"), we should technically receive params as a promise or props?
  // Actually in Next.js 15+, params is a Promise. Let's handle it.

  const { id } = use(params);
  // router is already declared above
  const [resumeData, setResumeData] = useState<any | undefined>(undefined);
  const { setWorkflowState } = useApp();

  // Show stepper as "Complete" when viewing detail page
  useEffect(() => {
    // Define steps locally or import. Importing is better but for now let's reproduce to avoid import issues if possible.
    // Ideally import { createSteps } from "../../../components/resume-wizard";
    // But let's just hardcode to ensure it works immediately without worrying about relative paths/exports if I failed the export step (which I shouldn't have).
    // Actually, I just exported it. Let's try to import it.
    // Wait, let's just define it here to be safe and fast.
    const steps = [
      { id: "upload", label: "업로드" },
      { id: "processing", label: "AI 처리" },
      { id: "edit", label: "편집" },
      { id: "preview", label: "템플릿 선택" },
      { id: "complete", label: "완료" },
    ];
    setWorkflowState(steps, "complete");

    // Cleanup on unmount?
    // If we leave this page, we might want to clear it.
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  useEffect(() => {
    // Check for temp data from wizard
    const stored = sessionStorage.getItem("tempResumeData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only use if it matches current ID or is a new creation flow for this session
        // For prototype simplicity, we use it if checking ID '1' or the passed ID matches
        if (parsed.id === id || (id === "1" && parsed.id.startsWith("new-"))) {
          setResumeData(parsed);
          // Optional: Clear it so refresh reverts to original? Or keep it?
          // sessionStorage.removeItem("tempResumeData");
        }
      } catch (e) {
        console.error("Failed to parse temp resume data");
      }
    }
  }, [id]);

  const handleBack = () => {
    router.push("/resumes");
  };

  const handleDelete = (id: string) => {
    // Mock delete
    router.push("/resumes");
  };

  const handleEdit = () => {
    router.push(`/resumes/${id}/edit`);
  };

  return (
    <ResumeDetailPage
      resumeId={id}
      resumeTitle={resumeData?.title}
      experiences={resumeData?.experiences}
      template={resumeData?.template}
      isWorkflowComplete={resumeData?.isJustCompleted}
      onBack={handleBack}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
}
