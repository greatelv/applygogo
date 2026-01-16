import {
  Menu,
  LogOut,
  Settings,
  Info,
  Sparkles,
  PanelLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { WorkflowStepper } from "./workflow-stepper";
import LanguageSwitcher from "./language-switcher";
import { Logo } from "./logo";

interface HeaderProps {
  plan: string;
  quota: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  onLogout: () => void;
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  workflowSteps?: Array<{ id: string; label: string; description?: string }>;
  currentStep?: string;
}

const planConfig: Record<
  string,
  { label: string; variant: "outline" | "secondary" | "default"; color: string }
> = {
  FREE: {
    label: "무료",
    variant: "outline" as const,
    color: "text-neutral-600",
  },
  PASS_7DAY: {
    label: "7일 이용권",
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  PASS_30DAY: {
    label: "30일 이용권",
    variant: "default" as const,
    color: "text-purple-600",
  },
  PASS_BETA_3DAY: {
    label: "베타 무제한",
    variant: "default" as const,
    color: "text-indigo-600",
  },
};

export function Header({
  plan,
  quota,
  userName,
  userEmail,
  userImage,
  onLogout,
  onMenuClick,
  onToggleSidebar,
  isSidebarOpen = true,
  workflowSteps,
  currentStep,
}: HeaderProps) {
  const config = planConfig[plan] || planConfig.FREE;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:pr-6 lg:pl-0">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-md mr-4"
          >
            <Menu className="size-5" />
          </button>

          {/* Desktop Logo Area + Toggle */}
          <div className="hidden lg:flex items-center justify-between pl-6 h-full w-60 border-r border-border/40 shrink-0">
            <Logo href="/resumes" />

            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mr-3 p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title={isSidebarOpen ? "사이드바 숨기기" : "사이드바 보이기"}
              >
                <PanelLeft className="size-4" />
              </button>
            )}
          </div>

          {/* Mobile Logo Only */}
          <Logo href="/resumes" className="lg:hidden mr-4" />

          {/* Workflow Stepper - starts after logo container */}
          {workflowSteps && currentStep && (
            <div className="hidden lg:flex items-center pl-6">
              <WorkflowStepper
                steps={workflowSteps}
                currentStep={currentStep}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Theme toggle - Hidden on mobile to save space with quota/avatar */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Upgrade CTA - Only for FREE plan */}
          {plan === "FREE" && (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm border-0 font-semibold"
            >
              <Link href="/settings#payment-section">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                이용권 구매
              </Link>
            </Button>
          )}

          {/* Plan badge - Clickable */}
          <a href="/settings#payment-section" className="hidden sm:inline-flex">
            <Badge
              variant={config.variant}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              {config.label}
            </Badge>
          </a>

          {/* Quota display - Desktop */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
            <span className="text-xs text-muted-foreground">남은 크레딧</span>
            <span className="font-semibold text-sm">{quota}</span>
          </div>

          {/* Quota display - Mobile (compact) */}
          <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
            <span className="text-xs text-muted-foreground">크레딧</span>
            <span className="font-semibold text-xs">{quota}</span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                suppressHydrationWarning
              >
                <Avatar className="size-8">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="sm:hidden">
                <span className="text-xs text-muted-foreground">이용권:</span>
                <span className="ml-2 font-semibold">{config.label}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">
                <span className="text-xs text-muted-foreground">크레딧:</span>
                <span className="ml-2 font-semibold">{quota}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="size-4 mr-2" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <Info className="size-4 mr-2" />
                  서비스 소개
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/blog" className="cursor-pointer">
                  <FileText className="size-4 mr-2" />
                  블로그
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="size-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Workflow Stepper - Mobile bottom */}
      {workflowSteps && currentStep && (
        <div className="lg:hidden px-4 py-3 border-t border-border/50 flex justify-center">
          <WorkflowStepper steps={workflowSteps} currentStep={currentStep} />
        </div>
      )}
    </header>
  );
}
