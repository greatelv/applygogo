import {
  FileText,
  CreditCard,
  CircleHelp,
  User,
  X,
  Plus,
  Settings,
  Info,
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
  { id: "home", label: "서비스 소개", icon: Info, href: "/" },
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

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
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
                    {item.href ? (
                      <a
                        href={item.href}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                        target="_self"
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                      </a>
                    ) : (
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
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
