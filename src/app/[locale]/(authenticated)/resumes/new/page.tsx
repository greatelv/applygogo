"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";
import { useApp } from "@/app/context/app-context";
import { NewResumePage } from "@/app/components/new-resume-page";
import { uploadResumeAction } from "@/app/lib/actions";

const steps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

export default function Page() {
  const router = useRouter();
  const { setWorkflowState } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setWorkflowState(steps, "upload");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadResumeAction(formData);

      if (result.success && result.resumeId) {
        router.push(`/resumes/${result.resumeId}/processing`);
      }
    } catch (error: any) {
      alert(error.message || "업로드 실패");
      setIsUploading(false);
    }
  };

  return <NewResumePage onUpload={handleUpload} isUploading={isUploading} />;
}
