"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ThemeProvider } from "../components/theme-provider";
import { LandingPage } from "../components/landing-page";
import { LoginPage } from "../components/login-page";
import { DashboardLayout } from "../components/dashboard-layout";
import { ResumesPage } from "../components/resumes-page";
import { NewResumePage } from "../components/new-resume-page";
import { BillingPage } from "../components/billing-page";

// Mock data (Resume list only)
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

export default function App() {
  const { data: session, status } = useSession();
  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState("resumes");
  const [plan, setPlan] = useState<"FREE" | "STANDARD" | "PRO">("FREE");
  const [quota, setQuota] = useState(2);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Effect to automatically show dashboard if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      setShowLanding(false);
      // Fetch resumes
      fetch("/api/resumes")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch");
        })
        .then((data) => setResumes(data))
        .catch((err) => console.error(err));
    }
  }, [status]);

  const handleGetStarted = () => {
    if (status === "authenticated") {
      setShowLanding(false);
    } else {
      setShowLanding(false); // Go to login
    }
  };

  const handleLogin = () => {
    signIn("google");
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`업로드 실패: ${errorData.error}`);
        return;
      }

      const newResume = await res.json();
      setResumes((prev) => [newResume, ...prev]);
      setCurrentPage("resumes");
    } catch (error) {
      console.error(error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
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
    // console.log("Selected resume:", id);
    // alert(`이력서 상세 페이지 (ID: ${id})\n\n이 기능은 추후 구현됩니다.`);
    window.location.href = `/resumes/${id}`;
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {showLanding && status !== "authenticated" ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : status !== "authenticated" ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardLayout
          plan={plan}
          quota={quota}
          userName={session?.user?.name || "사용자"}
          userEmail={session?.user?.email || ""}
          userImage={session?.user?.image || undefined}
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
