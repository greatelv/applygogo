"use client";

import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useApp } from "@/app/context/app-context";
import { useEffect } from "react";

const DynamicServiceLayout = dynamic(
  () => import("../components/service-layout").then((mod) => mod.ServiceLayout),
  { ssr: false }, // Keeping SSR disabled as requested
);

interface ClientServiceWrapperProps {
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

export function ClientServiceWrapper({
  children,
  user,
  logOutAction,
  initialPlan,
  initialQuota,
  locale,
}: ClientServiceWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract active item from pathname handling locale
  const segments = pathname?.split("/").filter(Boolean) || [];
  let activeItem = "resumes";

  // 경로에서 activeItem 추출 로직 단순화: 항상 locale 다음 segment가 item
  if (segments.length > 1) {
    activeItem = segments[1];
  } else {
    activeItem = segments[0] || "resumes";
  }

  // 이제 모든 console 경로는 /ko/resumes 처럼 locale prefix를 가짐
  const currentLocale = locale || "ko";
  const prefix = `/${currentLocale}`;

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
    <DynamicServiceLayout
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
      locale={currentLocale}
    >
      {children}
    </DynamicServiceLayout>
  );
}
