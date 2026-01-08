"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProcessingPage } from "@/app/components/processing-page";
import { useApp } from "@/app/context/app-context";

const steps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setWorkflowState } = useApp();

  useEffect(() => {
    setWorkflowState(steps, "processing");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

  const handleComplete = () => {
    router.push(`/resumes/${id}/edit`);
  };

  return (
    <ProcessingPage
      resumeTitle="이력서 처리 중..." // This could be fetched if we had a server wrapper
      resumeId={id}
      onComplete={handleComplete}
    />
  );
}
