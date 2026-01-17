"use client";

import { useRouter } from "next/navigation";
import { ResumesPage } from "./resumes-page";
import { Locale } from "@/lib/i18n-utils";
import { deleteGlobalResumeAction } from "@/lib/global-actions";
import { useTransition } from "react";
import { toast } from "sonner";

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
  const [isPending, startTransition] = useTransition();

  return (
    <ResumesPage
      resumes={resumes}
      locale={locale}
      onCreateNew={() => router.push(`/${locale}/resumes/new`)}
      onSelectResume={(id) => router.push(`/${locale}/resumes/${id}`)}
      onDelete={async (id) => {
        startTransition(async () => {
          const result = await deleteGlobalResumeAction(id, locale);
          if (result.success) {
            toast.success("Resume deleted");
            // router.refresh(); // Server action already revalidates
          } else {
            toast.error("Failed to delete resume");
            console.error(result.error);
          }
        });
      }}
      // onUpgrade={() => router.push(`/${locale}/pricing`)} // 추후 구현
      quota={100} // 임시로 충분한 quota 설정 (크레딧 시스템 통합 전)
    />
  );
}
