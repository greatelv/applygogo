"use client";
import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  plan: "FREE" | "STANDARD" | "PRO";
  quota: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout?: () => void;
  logoutAction?: () => Promise<void>;
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
  logoutAction,
  onCreateNew,
  workflowSteps,
  currentStep,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <Sidebar
          activeItem={activeItem}
          onNavigate={onNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCreateNew={onCreateNew}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            plan={plan}
            quota={quota}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            onLogout={onLogout}
            logoutAction={logoutAction}
            onMenuClick={() => setIsSidebarOpen(true)}
            workflowSteps={workflowSteps}
            currentStep={currentStep}
          />

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
