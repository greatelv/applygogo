"use client";

import { useRouter } from "next/navigation";
import { ResumesPage } from "../../components/resumes-page";

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

export function ResumesClient({ resumes, quota }: ResumesClientProps) {
  const router = useRouter();

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
            throw new Error(data.error || "이력서 삭제에 실패했습니다.");
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
