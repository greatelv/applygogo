"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/app/context/app-context";
import { NewResumePage } from "@/app/components/new-resume-page";
import { uploadResumeAction } from "@/app/lib/actions";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("workflow");
  const router = useRouter();
  const { locale } = useParams();
  const { setWorkflowState } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  const steps = useMemo(
    () => [
      { id: "upload", label: t("upload") },
      { id: "processing", label: t("processing") },
      { id: "edit", label: t("edit") },
      { id: "preview", label: t("template") },
      { id: "complete", label: t("complete") },
    ],
    [t],
  );

  useEffect(() => {
    setWorkflowState(steps, "upload");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, steps]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadResumeAction(
        (locale as string) || "ko",
        formData,
      );

      if (result.success && result.resumeId) {
        router.push(`/resumes/${result.resumeId}/processing`);
      }
    } catch (error: any) {
      alert(error.message || t("uploadError"));
      setIsUploading(false);
    }
  };

  return <NewResumePage onUpload={handleUpload} isUploading={isUploading} />;
}
