"use client";

import { use } from "react";
import { ResumeWizard } from "../../../../components/resume-wizard";

// Mock data getter (in real app, use SWR or React Query or Server Component)
const getMockResume = (id: string) => {
  return {
    id,
    title: "소프트웨어 엔지니어 이력서.pdf",
    experiences: [
      {
        id: "1",
        company: "(주)테크스타트업",
        companyEn: "TechStartup Inc.",
        position: "프론트엔드 개발자",
        positionEn: "Frontend Developer",
        period: "2022.03 - 현재",
        bullets: [
          "React 및 TypeScript 기반 웹 애플리케이션 개발 및 유지보수",
          "반응형 UI/UX 구현으로 모바일 사용자 경험 30% 개선",
        ],
        bulletsEn: [
          "Developed and maintained web applications using React and TypeScript",
          "Improved mobile user experience by 30% through responsive UI/UX implementation",
        ],
      },
    ],
    template: "modern",
  };
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const initialData = getMockResume(id);

  return <ResumeWizard initialMode="edit" initialData={initialData} />;
}
