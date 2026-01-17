"use client";

import {
  FileText,
  CreditCard,
  CircleHelp,
  User,
  X,
  Plus,
  Settings,
  Info,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FeedbackModal } from "./feedback-modal";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  onCreateNew?: () => void;
}

export function Sidebar({
  activeItem,
  onNavigate,
  isMobileOpen,
  isDesktopOpen,
  onCloseMobile,
  onCreateNew,
}: SidebarProps) {
  const t = useTranslations("sidebar");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const navItems = [
    { id: "resumes", label: t("nav.resumes"), icon: FileText },
    { id: "settings", label: t("nav.settings"), icon: Settings },
    { id: "help", label: t("nav.help"), icon: CircleHelp },
    { id: "home", label: t("nav.home"), icon: Info, href: "/" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-[100] w-60 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !isDesktopOpen && "lg:hidden",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
            <span className="font-semibold">{t("menu")}</span>
            <button
              onClick={onCloseMobile}
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
                    onCloseMobile();
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  size="default"
                >
                  <Plus className="size-4" />
                  {t("createNew")}
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
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}
                        target={(item as any).target || "_self"}
                        rel={
                          (item as any).target === "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          onNavigate(item.id);
                          onCloseMobile();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          activeItem === item.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
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

          <div className="p-4 border-t border-border">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <MessageSquarePlus className="size-4 shrink-0" />
              {t("feedback")}
            </button>
          </div>
        </div>
        <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
      </aside>
    </>
  );
}
