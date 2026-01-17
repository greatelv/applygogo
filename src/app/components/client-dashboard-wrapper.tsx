"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useApp } from "../context/app-context";
import { useEffect } from "react";

const DynamicDashboardLayout = dynamic(
  () =>
    import("../components/dashboard-layout").then((mod) => mod.DashboardLayout),
  { ssr: false }, // Keeping SSR disabled as requested
);

interface ClientDashboardWrapperProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  logOutAction: (redirectTo?: string) => Promise<void>;
  initialPlan: string;
  initialQuota: number;
}

export function ClientDashboardWrapper({
  children,
  user,
  logOutAction,
  initialPlan,
  initialQuota,
}: ClientDashboardWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Extract active item from pathname
  const activeItem = pathname?.split("/").filter(Boolean)[0] || "resumes";

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const { workflowSteps, currentStep, plan, quota, setPlan, setQuota } =
    useApp();

  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
    }
    if (typeof initialQuota === "number") {
      setQuota(initialQuota);
    }
  }, [initialPlan, initialQuota, setPlan, setQuota]);

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
        await logOutAction(`/${locale}`);
      }}
      onCreateNew={() => router.push("/resumes/new")}
      workflowSteps={workflowSteps}
      currentStep={currentStep}
    >
      {children}
    </DynamicDashboardLayout>
  );
}
