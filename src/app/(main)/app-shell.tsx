"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { logout } from "@/app/actions";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  plan: "FREE" | "STANDARD" | "PRO";
  quota: number;
}

export function AppShell({ children, user, plan, quota }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active item based on pathname
  // /resumes -> resumes
  // /new -> new
  // /profile -> profile
  // /billing -> billing
  // /help -> help

  const getActiveItem = () => {
    if (pathname === "/resumes" || pathname.startsWith("/resumes"))
      return "resumes";
    if (pathname.startsWith("/new")) return "new";
    if (pathname === "/profile" || pathname.startsWith("/profile"))
      return "profile";
    if (pathname === "/billing" || pathname.startsWith("/billing"))
      return "billing";
    if (pathname === "/help" || pathname.startsWith("/help")) return "help";
    return "resumes"; // Default fallback
  };

  const handleNavigate = (item: string) => {
    switch (item) {
      case "resumes":
        router.push("/resumes");
        break;
      case "new":
        router.push("/new");
        break;
      case "billing":
        router.push("/billing");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "help":
        router.push("/help");
        break;
      default:
        router.push("/resumes");
    }
  };

  return (
    <AppLayout
      plan={plan}
      quota={quota}
      userName={user.name}
      userEmail={user.email}
      userImage={user.image}
      activeItem={getActiveItem()}
      onNavigate={handleNavigate}
      logoutAction={logout}
      onCreateNew={() => router.push("/new")}
    >
      {children}
    </AppLayout>
  );
}
