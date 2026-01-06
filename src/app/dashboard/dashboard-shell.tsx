"use client";

import { usePathname, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { logout } from "@/app/actions";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  plan: "FREE" | "STANDARD" | "PRO";
  quota: number;
}

export function DashboardShell({
  children,
  user,
  plan,
  quota,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active item based on pathname
  // /dashboard -> resumes
  // /dashboard/resumes -> resumes
  // /dashboard/new -> new
  // /dashboard/profile -> profile
  // /dashboard/billing -> billing
  // /dashboard/help -> help

  const getActiveItem = () => {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/resumes"))
      return "resumes";
    if (pathname.startsWith("/dashboard/new")) return "new";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
    if (pathname.startsWith("/dashboard/billing")) return "billing";
    if (pathname.startsWith("/dashboard/help")) return "help";
    return "resumes";
  };

  const handleNavigate = (item: string) => {
    switch (item) {
      case "resumes":
        router.push("/dashboard/resumes");
        break;
      case "new":
        router.push("/dashboard/new");
        break;
      case "billing":
        router.push("/dashboard/billing");
        break;
      case "profile":
        router.push("/dashboard/profile");
        break;
      case "help":
        router.push("/dashboard/help");
        break;
      default:
        router.push("/dashboard");
    }
  };

  return (
    <DashboardLayout
      plan={plan}
      quota={quota}
      userName={user.name}
      userEmail={user.email}
      userImage={user.image}
      activeItem={getActiveItem()}
      onNavigate={handleNavigate}
      logoutAction={logout}
      onCreateNew={() => router.push("/dashboard/new")}
    >
      {children}
    </DashboardLayout>
  );
}
