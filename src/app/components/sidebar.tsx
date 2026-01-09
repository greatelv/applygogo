import {
  FileText,
  CreditCard,
  CircleHelp,
  User,
  X,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onCreateNew?: () => void;
}

const navItems = [
  { id: "resumes", label: "이력서 관리", icon: FileText },
  { id: "settings", label: "설정", icon: Settings },
  { id: "help", label: "도움말", icon: CircleHelp },
];

export function Sidebar({
  activeItem,
  onNavigate,
  isOpen,
  onClose,
  onCreateNew,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-60 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
            <span className="font-semibold">메뉴</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Logo */}
          <div className="p-6 border-b border-border hidden lg:block">
            <h2 className="text-xl tracking-tight">지원고고</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            {/* Create New Button */}
            {onCreateNew && (
              <div className="mb-4">
                <Button
                  onClick={() => {
                    onCreateNew();
                    onClose();
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  size="default"
                >
                  <Plus className="size-4" />새 이력서 만들기
                </Button>
              </div>
            )}

            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        activeItem === item.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>© 2026 지원고고</p>
              <div className="flex gap-3">
                <a href="#" className="hover:text-foreground">
                  문의
                </a>
                <a href="#" className="hover:text-foreground">
                  도움말
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
