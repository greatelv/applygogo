"use client";

import { ResumesPage } from "../../components/resumes-page";
import { useRouter } from "next/navigation";

const mockResumes = [
  {
    id: "1",
    title: "소프트웨어 엔지니어 이력서.pdf",
    status: "COMPLETED" as const,
    updatedAt: "2026-01-05",
  },
  {
    id: "2",
    title: "프로덕트 매니저 이력서.pdf",
    status: "TRANSLATED" as const,
    updatedAt: "2026-01-03",
  },
];

export default function Page() {
  const router = useRouter();

  return (
    <ResumesPage
      resumes={mockResumes}
      quota={2}
      onCreateNew={() => router.push("/resumes/new")}
      onSelectResume={(id) => router.push(`/resumes/${id}`)}
      onUpgrade={() => router.push("/billing")}
    />
  );
}
