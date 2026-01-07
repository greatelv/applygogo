"use client";

import { useRouter } from "next/navigation";
import { ResumesPage } from "@/components/resumes-page";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
  updatedAt: string;
}

interface ResumesClientPageProps {
  resumes: Resume[];
  quota: number;
}

export function ResumesClientPage({ resumes, quota }: ResumesClientPageProps) {
  const router = useRouter();

  return (
    <ResumesPage
      resumes={resumes}
      quota={quota}
      onCreateNew={() => router.push("/new")}
      onSelectResume={(id) => router.push(`/resumes/${id}`)}
      onUpgrade={() => router.push("/billing")}
    />
  );
}
