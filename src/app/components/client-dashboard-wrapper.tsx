"use client";

import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useApp } from "@/app/context/app-context";
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
  logOutAction: () => Promise<void>;
  initialPlan: string;
  initialQuota: number;
  locale?: string;
}

export function ClientDashboardWrapper({
  children,
  user,
  logOutAction,
  initialPlan,
  initialQuota,
  locale,
}: ClientDashboardWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract active item from pathname handling locale
  const segments = pathname?.split("/").filter(Boolean) || [];
  let activeItem = "resumes";

  // If first segment is locale (en, ja), take the second segment
  if (locale && segments[0] === locale) {
    activeItem = segments[1] || "resumes";
  } else {
    // Korean version or direct path
    activeItem = segments[0] || "resumes";
  }

  const prefix = locale ? `/${locale}` : "";

  const handleNavigate = (page: string) => {
    router.push(`${prefix}/${page}`);
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
        await logOutAction();
      }}
      onCreateNew={() => router.push(`${prefix}/resumes/new`)}
      workflowSteps={workflowSteps}
      currentStep={currentStep}
      locale={locale}
    >
      {children}
    </DynamicDashboardLayout>
  );
}
