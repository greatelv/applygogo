import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { SiteFooter } from "./site-footer";
import { BetaBanner } from "./beta-banner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  plan: string;
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

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
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onToggleSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
          isSidebarOpen={isDesktopSidebarOpen}
          workflowSteps={workflowSteps}
          currentStep={currentStep}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            activeItem={activeItem}
            onNavigate={onNavigate}
            isMobileOpen={isMobileSidebarOpen}
            isDesktopOpen={isDesktopSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onCreateNew={onCreateNew}
          />

          <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
            {/* Beta Banner */}
            <BetaBanner isConsole={true} />
            <main className="flex-1 p-4 lg:p-8">{children}</main>
            <SiteFooter simple={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
