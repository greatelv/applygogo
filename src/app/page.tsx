"use client";

import { useState } from "react";
import { ThemeProvider } from "../components/theme-provider";
import { LandingPage } from "../components/landing-page";
import { LoginPage } from "../components/login-page";
import { DashboardLayout } from "../components/dashboard-layout";
import { ResumesPage } from "../components/resumes-page";
import { NewResumePage } from "../components/new-resume-page";
import { BillingPage } from "../components/billing-page";

// Mock data
const mockUser = {
  name: "홍길동",
  email: "hong@example.com",
  image: undefined,
};

type ResumeStatus =
  | "IDLE"
  | "SUMMARIZED"
  | "TRANSLATED"
  | "COMPLETED"
  | "FAILED";

interface Resume {
  id: string;
  title: string;
  status: ResumeStatus;
  updatedAt: string;
}

const mockResumes: Resume[] = [
  {
    id: "1",
    title: "소프트웨어 엔지니어 이력서.pdf",
    status: "COMPLETED",
    updatedAt: "2026-01-05",
  },
  {
    id: "2",
    title: "프로덕트 매니저 이력서.pdf",
    status: "TRANSLATED",
    updatedAt: "2026-01-03",
  },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("resumes");
  const [plan, setPlan] = useState<"FREE" | "STANDARD" | "PRO">("FREE");
  const [quota, setQuota] = useState(2);
  const [resumes, setResumes] = useState(mockResumes);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("resumes");
    setShowLanding(true);
  };

  const handleUpload = (file: File) => {
    console.log("Uploading file:", file.name);
    // Mock: Add new resume
    const newResume = {
      id: String(Date.now()),
      title: file.name,
      status: "IDLE" as const,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setResumes([newResume, ...resumes]);
    setCurrentPage("resumes");
  };

  const handleUpgrade = (newPlan: "STANDARD" | "PRO") => {
    setPlan(newPlan);
    setQuota(newPlan === "STANDARD" ? 6 : 20);
    alert(`${newPlan} 플랜으로 업그레이드되었습니다!`);
  };

  const handleCancel = () => {
    if (
      confirm(
        "정말 플랜을 해지하시겠습니까? 현재 결제 주기가 끝나면 Free 플랜으로 전환됩니다."
      )
    ) {
      alert("플랜 해지가 예약되었습니다.");
    }
  };

  const handleSelectResume = (id: string) => {
    console.log("Selected resume:", id);
    alert(`이력서 상세 페이지 (ID: ${id})\n\n이 기능은 추후 구현됩니다.`);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {showLanding ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : !isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardLayout
          plan={plan}
          quota={quota}
          userName={mockUser.name}
          userEmail={mockUser.email}
          userImage={mockUser.image}
          activeItem={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        >
          {currentPage === "resumes" && (
            <ResumesPage
              resumes={resumes}
              onCreateNew={() => setCurrentPage("new")}
              onSelectResume={handleSelectResume}
            />
          )}
          {currentPage === "new" && <NewResumePage onUpload={handleUpload} />}
          {currentPage === "billing" && (
            <BillingPage
              currentPlan={plan}
              quota={quota}
              onUpgrade={handleUpgrade}
              onCancel={handleCancel}
            />
          )}
        </DashboardLayout>
      )}
    </ThemeProvider>
  );
}
