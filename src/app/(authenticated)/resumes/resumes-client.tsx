"use client";

import { useRouter } from "next/navigation";
import { ResumesPage } from "../../components/resumes-page";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
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
      onUpgrade={() => router.push("/pricing")}
      quota={quota}
    />
  );
}
