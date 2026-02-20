"use client";

import { useRouter } from "@/i18n/routing";
import { ResumesPage } from "@/app/components/resumes-page";
import { useTranslations } from "next-intl";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
  currentStep: "UPLOAD" | "PROCESSING" | "EDIT" | "TEMPLATE" | "COMPLETED";
  updatedAt: string;
}

interface ResumesClientProps {
  resumes: Resume[];
  quota?: number;
}

export function ResumesClient({
  resumes,
  quota,
}: ResumesClientProps) {
  const router = useRouter();
  const t = useTranslations("resumes");

  return (
    <ResumesPage
      resumes={resumes}
      onCreateNew={() => router.push("/resumes/new")}
      onSelectResume={(id) => router.push(`/resumes/${id}`)}
      onDelete={async (id) => {
        try {
          const res = await fetch(`/api/resumes/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || t("error"));
          }

          router.refresh();
        } catch (error: any) {
          console.error("Delete error:", error);
          alert(error.message);
        }
      }}
      onUpgrade={() => router.push("/pricing")}
      quota={quota}
    />
  );
}
