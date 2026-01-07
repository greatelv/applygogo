import { useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { LandingPage } from "./components/landing-page";
import { LoginPage } from "./components/login-page";
import { DashboardLayout } from "./components/dashboard-layout";
import { ResumesPage } from "./components/resumes-page";
import { NewResumePage } from "./components/new-resume-page";
import { ProcessingPage } from "./components/processing-page";
import { ResumeEditPage } from "./components/resume-edit-page";
import { ResumePreviewPage } from "./components/resume-preview-page";
import { ResumeDetailPage } from "./components/resume-detail-page";
import { BillingPage } from "./components/billing-page";
import { ProfilePage } from "./components/profile-page";
import { HelpPage } from "./components/help-page";
import { Toaster } from "sonner";

// Mock data
const mockUser = {
  name: "홍길동",
  email: "hong@example.com",
  image: undefined,
};

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

type WorkflowStep = "upload" | "processing" | "edit" | "preview" | "complete";

const workflowSteps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
];

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

interface TranslatedExperience extends Experience {
  companyEn: string;
  positionEn: "Frontend Developer" | "Junior Developer";
  bulletsEn: string[];
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("resumes");
  const [plan, setPlan] = useState<"FREE" | "STANDARD" | "PRO">("FREE");
  const [quota, setQuota] = useState(2);
  const [resumes, setResumes] = useState(mockResumes);

  // Workflow state
  const [workflowStep, setWorkflowStep] = useState<string | null>(null);
  const [currentResumeTitle, setCurrentResumeTitle] = useState("");
  const [currentTranslated, setCurrentTranslated] = useState<TranslatedExperience[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState("modern");
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isJustCompleted, setIsJustCompleted] = useState(false); // 워크플로우 완료 직후 여부
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

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
    setWorkflowStep(null);
  };

  // Start workflow
  const handleUpload = (file: File) => {
    console.log("Uploading file:", file.name);
    setCurrentResumeTitle(file.name);
    setIsEditingExisting(false); // Reset editing flag for new resume
    setWorkflowStep("processing");
    // 크레딧 차감은 AI 처리 완료 시점으로 이동
  };

  // Processing -> Edit
  const handleProcessingComplete = () => {
    // AI 처리 완료 시 크레딧 차감
    if (quota > 0) {
      setQuota(quota - 1);
    }
    setWorkflowStep("edit");
  };

  // Edit -> Preview
  const handleEditNext = (experiences: TranslatedExperience[]) => {
    setCurrentTranslated(experiences);
    setWorkflowStep("preview");
  };

  const handleEditBack = () => {
    setWorkflowStep("upload");
    setCurrentPage("new");
  };

  // Preview -> Complete
  const handlePreviewNext = (templateId: string) => {
    console.log("Selected template:", templateId);
    setCurrentTemplate(templateId);
    setIsJustCompleted(true); // 워크플로우 완료 직후
    setWorkflowStep("complete");
  };

  const handlePreviewBack = () => {
    // If editing existing resume, go back to edit step
    // Otherwise return to upload
    if (isEditingExisting) {
      setWorkflowStep("edit");
    } else {
      setWorkflowStep("edit");
    }
  };

  // Complete -> Save & Exit
  const handleCompleteDownload = () => {
    // Add to resumes list
    const newResume = {
      id: String(Date.now()),
      title: currentResumeTitle,
      status: "COMPLETED" as const,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setResumes([newResume, ...resumes]);
    
    // Reset workflow
    setWorkflowStep(null);
    setCurrentPage("resumes");
    
    alert("이력서가 성공적으로 생성되었습니다! 🎉");
  };

  const handleCompleteBack = () => {
    setWorkflowStep("preview");
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
    // Load resume data for viewing
    const mockTranslatedData: TranslatedExperience[] = [
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
      {
        id: "2",
        company: "디지털에이전시 ABC",
        companyEn: "Digital Agency ABC",
        position: "주니어 개발자",
        positionEn: "Junior Developer",
        period: "2020.06 - 2022.02",
        bullets: [
          "Vue.js 기반 고객사 웹사이트 5개 이상 개발",
          "RESTful API 연동 및 상태 관리 라이브러리 활용",
        ],
        bulletsEn: [
          "Developed 5+ client websites using Vue.js framework",
          "Integrated RESTful APIs and utilized state management libraries",
        ],
      },
    ];

    const resume = resumes.find(r => r.id === id);
    if (resume) {
      setSelectedResumeId(id);
      setCurrentResumeTitle(resume.title);
      setCurrentTranslated(mockTranslatedData);
      setCurrentTemplate("modern");
      setIsEditingExisting(false); // 조회 모드
      setIsJustCompleted(false); // 기존 이력서 조회
      setWorkflowStep("complete"); // Stepper 표시를 위해 complete로 설정
    }
  };

  const handleEditResume = (id: string) => {
    // Load resume data (in real app, fetch from API)
    // Using mock data for demonstration
    const mockTranslatedData: TranslatedExperience[] = [
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
      {
        id: "2",
        company: "디지털에이전시 ABC",
        companyEn: "Digital Agency ABC",
        position: "주니어 개발자",
        positionEn: "Junior Developer",
        period: "2020.06 - 2022.02",
        bullets: [
          "Vue.js 기반 고객사 웹사이트 5개 이상 개발",
          "RESTful API 연동 및 상태 관리 라이브러리 활용",
        ],
        bulletsEn: [
          "Developed 5+ client websites using Vue.js framework",
          "Integrated RESTful APIs and utilized state management libraries",
        ],
      },
    ];

    const resume = resumes.find(r => r.id === id);
    if (resume) {
      setSelectedResumeId(id);
      setCurrentResumeTitle(resume.title);
      setCurrentTranslated(mockTranslatedData);
      setCurrentTemplate("modern");
      setIsEditingExisting(true);
      setWorkflowStep("edit"); // Changed from "preview" to "edit"
    }
  };

  const handleDeleteResume = (id: string) => {
    setResumes(resumes.filter(r => r.id !== id));
  };

  const handleDeleteAccount = () => {
    alert("계정 삭제 기능은 개발 예정입니다.");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setWorkflowStep(null);
    setSelectedResumeId(null);
  };

  // Render workflow pages
  const renderWorkflow = () => {
    if (workflowStep === "upload") {
      return <NewResumePage onUpload={handleUpload} />;
    }

    if (workflowStep === "processing") {
      return (
        <ProcessingPage
          resumeTitle={currentResumeTitle}
          onComplete={handleProcessingComplete}
        />
      );
    }

    if (workflowStep === "edit") {
      return (
        <ResumeEditPage
          resumeTitle={currentResumeTitle}
          initialExperiences={isEditingExisting ? currentTranslated : undefined}
          isEditingExisting={isEditingExisting}
          quota={quota}
          onNext={handleEditNext}
          onBack={handleEditBack}
          onRetranslate={() => {
            // 재번역 시 크레딧 차감
            if (quota > 0) {
              setQuota(quota - 1);
              alert("AI 재번역을 시작합니다. 크레딧 1개가 차감됩니다.");
            } else {
              alert("크레딧이 부족합니다. 플랜을 업그레이드하세요.");
            }
          }}
        />
      );
    }

    if (workflowStep === "preview") {
      return (
        <ResumePreviewPage
          resumeTitle={currentResumeTitle}
          experiences={currentTranslated}
          currentPlan={plan}
          onNext={handlePreviewNext}
          onBack={handlePreviewBack}
          onUpgrade={() => setCurrentPage("billing")}
        />
      );
    }

    if (workflowStep === "complete") {
      return (
        <ResumeDetailPage
          resumeTitle={currentResumeTitle}
          experiences={currentTranslated}
          template={currentTemplate}
          isWorkflowComplete={isJustCompleted} // 워크플로우 완료 직후에만 true
          onBack={() => {
            if (isEditingExisting && selectedResumeId) {
              // Update existing resume
              setResumes(prev =>
                prev.map(r =>
                  r.id === selectedResumeId
                    ? { ...r, updatedAt: new Date().toISOString().split("T")[0] }
                    : r
                )
              );
            } else {
              // Add new resume to list
              const newResume = {
                id: String(Date.now()),
                title: currentResumeTitle,
                status: "COMPLETED" as const,
                updatedAt: new Date().toISOString().split("T")[0],
              };
              setResumes([newResume, ...resumes]);
            }
            
            // Reset workflow
            setWorkflowStep(null);
            setIsEditingExisting(false);
            setIsJustCompleted(false);
            setSelectedResumeId(null);
            setCurrentPage("resumes");
          }}
          onDownload={() => {
            alert("PDF 다운로드가 시작됩니다...");
          }}
          onEdit={
            !isJustCompleted && selectedResumeId
              ? () => handleEditResume(selectedResumeId)
              : undefined
          }
        />
      );
    }

    return null;
  };

  // Render main pages
  const renderPage = () => {
    // If in workflow, render workflow pages
    if (workflowStep) {
      return renderWorkflow();
    }

    // Otherwise render normal pages
    switch (currentPage) {
      case "resumes":
        return (
          <ResumesPage
            resumes={resumes}
            quota={quota}
            onCreateNew={() => {
              if (quota > 0) {
                setCurrentPage("new");
                setWorkflowStep("upload");
              } else {
                alert("크레딧이 부족합니다. 플랜을 업그레이드하세요.");
              }
            }}
            onSelectResume={handleSelectResume}
            onUpgrade={() => setCurrentPage("billing")}
          />
        );

      case "new":
        return <NewResumePage onUpload={handleUpload} />;

      case "resume-detail":
        return selectedResumeId ? (
          <ResumeDetailPage
            resumeId={selectedResumeId}
            onBack={() => setCurrentPage("resumes")}
            onDelete={handleDeleteResume}
            onEdit={() => handleEditResume(selectedResumeId)}
          />
        ) : null;

      case "billing":
        return (
          <BillingPage
            currentPlan={plan}
            quota={quota}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
          />
        );

      case "profile":
        return (
          <ProfilePage
            userName={mockUser.name}
            userEmail={mockUser.email}
            userImage={mockUser.image}
            plan={plan}
            createdAt="2024-01-01"
            onDeleteAccount={handleDeleteAccount}
          />
        );

      case "help":
        return <HelpPage />;

      default:
        return (
          <ResumesPage
            resumes={resumes}
            quota={quota}
            onCreateNew={() => {
              if (quota > 0) {
                setCurrentPage("new");
                setWorkflowStep("upload");
              } else {
                alert("크레딧이 부족합니다. 플랜을 업그레이드하세요.");
              }
            }}
            onSelectResume={handleSelectResume}
            onUpgrade={() => setCurrentPage("billing")}
          />
        );
    }
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
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onCreateNew={() => {
            setCurrentPage("new");
            setWorkflowStep("upload");
          }}
          workflowSteps={workflowStep ? workflowSteps : undefined}
          currentStep={workflowStep || undefined}
        >
          {renderPage()}
        </DashboardLayout>
      )}
      <Toaster />
    </ThemeProvider>
  );
}