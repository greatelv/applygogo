"use client";

import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DashboardLayout } from "../components/dashboard-layout";
import { useApp } from "../context/app-context";

// Mock data
const mockUser = {
  name: "홍길동",
  email: "hong@example.com",
  image: undefined,
};

const DynamicDashboardLayout = dynamic(
  () =>
    import("../components/dashboard-layout").then((mod) => mod.DashboardLayout),
  { ssr: false }
);

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract active item from pathname
  // e.g. /resumes -> 'resumes'
  // /billing -> 'billing'
  const activeItem = pathname?.split("/").filter(Boolean)[0] || "resumes";

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleLogout = () => {
    router.push("/");
  };

  const { workflowSteps, currentStep, plan, quota, setPlan, setQuota } =
    useApp();

  return (
    <DynamicDashboardLayout
      plan={plan}
      quota={quota}
      userName={mockUser.name}
      userEmail={mockUser.email}
      userImage={mockUser.image}
      activeItem={activeItem}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onCreateNew={() => router.push("/resumes/new")}
      workflowSteps={workflowSteps}
      currentStep={currentStep}
    >
      {children}
    </DynamicDashboardLayout>
  );
}
