import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { SiteFooter } from "./site-footer";
import { BetaBanner } from "./beta-banner";
import { usePathname } from "@/i18n/routing";

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
  const pathname = usePathname();

  // Show BetaBanner only on the Resume Management page (list)
  // Landing Page has its own layout, so we don't need to worry about it here,
  // but if this layout were used there, we'd add '/' too.
  // The user requested: "Resume Management" and "Landing Page".
  // 'Resumes' path is likely '/resumes'.
  const showBetaBanner = pathname === "/resumes";

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
          hideLanguageSwitcher={true}
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
            {/* Beta Banner - Only visible on specific pages */}
            {showBetaBanner && <BetaBanner isConsole={true} />}
            <main className="flex-1 p-4 lg:p-8">{children}</main>
            <SiteFooter simple={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
