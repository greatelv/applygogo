"use client";

import { useRouter } from "next/navigation";
import { ResumesPage } from "./resumes-page";
import { Locale } from "@/lib/i18n-utils";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
  currentStep: "UPLOAD" | "PROCESSING" | "EDIT" | "TEMPLATE" | "COMPLETED";
  updatedAt: string;
}

interface GlobalResumesClientProps {
  resumes: Resume[];
  locale: Locale;
  // quota: number; // Global doesn't use quota yet or uses shared billing
}

export function GlobalResumesClient({
  resumes,
  locale,
}: GlobalResumesClientProps) {
  const router = useRouter();

  return (
    <ResumesPage
      resumes={resumes}
      locale={locale}
      onCreateNew={() => router.push(`/${locale}/resumes/new`)} // 한국향과 경로 통일
      onSelectResume={(id) => router.push(`/${locale}/resumes/${id}`)} // 한국향과 경로 통일
      onDelete={async (id) => {
        if (!confirm("Are you sure?")) return;
        // 추후 구현: await fetch(`/api/global-resumes/${id}`, { method: "DELETE" });
        alert("Delete not implemented yet for global resumes");
        router.refresh();
      }}
      // onUpgrade={() => router.push(`/${locale}/pricing`)} // 추후 구현
      quota={100} // 임시로 충분한 quota 설정 (크레딧 시스템 통합 전)
    />
  );
}
