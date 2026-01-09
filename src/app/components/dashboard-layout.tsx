import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { SiteFooter } from "./site-footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  plan: "FREE" | "STANDARD" | "PRO";
  quota: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  onCreateNew?: () => void;
  workflowSteps?: Array<{ id: string; label: string; description?: string }>;
  currentStep?: string;
}

export function DashboardLayout({
  children,
  plan,
  quota,
  userName,
  userEmail,
  userImage,
  activeItem,
  onNavigate,
  onLogout,
  onCreateNew,
  workflowSteps,
  currentStep,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-muted/30">
      <div className="flex flex-col h-full">
        <Header
          plan={plan}
          quota={quota}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          onLogout={onLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
          workflowSteps={workflowSteps}
          currentStep={currentStep}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            activeItem={activeItem}
            onNavigate={onNavigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onCreateNew={onCreateNew}
          />

          <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
            <main className="flex-1 p-4 lg:p-8">{children}</main>
            <SiteFooter simple={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
