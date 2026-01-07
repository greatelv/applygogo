"use client";

import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useApp } from "../context/app-context";

const DynamicDashboardLayout = dynamic(
  () =>
    import("../components/dashboard-layout").then((mod) => mod.DashboardLayout),
  { ssr: false } // Keeping SSR disabled as requested
);

interface ClientDashboardWrapperProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  logOutAction: () => Promise<void>;
}

export function ClientDashboardWrapper({
  children,
  user,
  logOutAction,
}: ClientDashboardWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract active item from pathname
  const activeItem = pathname?.split("/").filter(Boolean)[0] || "resumes";

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const { workflowSteps, currentStep, plan, quota } = useApp();

  return (
    <DynamicDashboardLayout
      plan={plan}
      quota={quota}
      userName={user.name || "User"}
      userEmail={user.email || ""}
      userImage={user.image || undefined}
      activeItem={activeItem}
      onNavigate={handleNavigate}
      onLogout={async () => {
        await logOutAction();
      }}
      onCreateNew={() => router.push("/resumes/new")}
      workflowSteps={workflowSteps}
      currentStep={currentStep}
    >
      {children}
    </DynamicDashboardLayout>
  );
}
