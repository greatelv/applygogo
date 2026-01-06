import { Menu, LogOut } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  plan: "FREE" | "STANDARD" | "PRO";
  quota: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  onLogout: () => void;
  onMenuClick: () => void;
}

const planConfig = {
  FREE: {
    label: "Free",
    variant: "outline" as const,
    color: "text-neutral-600",
  },
  STANDARD: {
    label: "Standard",
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  PRO: { label: "Pro", variant: "default" as const, color: "text-purple-600" },
};

export function Header({
  plan,
  quota,
  userName,
  userEmail,
  userImage,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const config = planConfig[plan];
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-md"
          >
            <Menu className="size-5" />
          </button>

          {/* Mobile logo */}
          <h1 className="text-lg tracking-tight lg:hidden">지원고고</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Plan badge */}
          <Badge variant={config.variant} className="hidden sm:inline-flex">
            {config.label}
          </Badge>

          {/* Quota display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
            <span className="text-xs text-muted-foreground">남은 크레딧</span>
            <span className="font-semibold text-sm">{quota}</span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                <span className="text-xs text-muted-foreground">플랜:</span>
                <span className="ml-2 font-semibold">{config.label}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">
                <span className="text-xs text-muted-foreground">크레딧:</span>
                <span className="ml-2 font-semibold">{quota}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="size-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
