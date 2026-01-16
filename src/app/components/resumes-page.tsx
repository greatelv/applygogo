import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
  currentStep: "UPLOAD" | "PROCESSING" | "EDIT" | "TEMPLATE" | "COMPLETED";
  updatedAt: string;
}

interface ResumesPageProps {
  resumes: Resume[];
  onCreateNew: () => void;
  onSelectResume: (id: string) => void;
  onDelete?: (id: string) => void;
  quota?: number;
  onUpgrade?: () => void;
  showBetaBanner?: boolean;
}

import { useTranslations, useLocale } from "next-intl";

export function ResumesPage({
  resumes,
  onCreateNew,
  onSelectResume,
  onDelete,
  quota = 0,
  onUpgrade,
  showBetaBanner,
}: ResumesPageProps) {
  const t = useTranslations("App.resumes");
  const locale = useLocale();

  const stepConfig = {
    UPLOAD: { label: t("steps.uploading"), variant: "secondary" as const },
    PROCESSING: { label: t("steps.processing"), variant: "secondary" as const },
    EDIT: { label: t("steps.edit"), variant: "outline" as const },
    TEMPLATE: { label: t("steps.template"), variant: "outline" as const },
    COMPLETED: { label: t("steps.completed"), variant: "success" as const },
  };

  const statusConfig = {
    IDLE: { label: t("steps.uploading"), variant: "outline" as const },
    SUMMARIZED: { label: t("steps.processing"), variant: "secondary" as const },
    TRANSLATED: { label: t("steps.processing"), variant: "secondary" as const },
    COMPLETED: { label: t("steps.completed"), variant: "success" as const },
    FAILED: { label: "Failed", variant: "warning" as const },
  };

  const hasNoCredits = quota === 0;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (resumes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-20 px-4">
          <div className="relative mb-8 mx-auto w-48 h-64 bg-background border rounded-lg shadow-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            {/* Resume Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/50" />
            <div className="p-4 space-y-3 opacity-50 blur-[0.5px] group-hover:blur-0 group-hover:opacity-100 transition-all duration-500">
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-1/2 bg-muted rounded" />
                  <div className="h-1.5 w-1/3 bg-muted rounded" />
                </div>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-muted rounded" />
                <div className="h-1.5 w-5/6 bg-muted rounded" />
                <div className="h-1.5 w-4/6 bg-muted rounded" />
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="h-1.5 w-1/4 bg-primary/20 rounded mb-2" />
                <div className="h-1.5 w-full bg-muted rounded" />
                <div className="h-1.5 w-full bg-muted rounded" />
              </div>
            </div>
            {/* Floating Plus Icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-[1px] group-hover:backdrop-blur-none bg-gradient-to-t from-background via-transparent to-transparent">
              <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse">
                <Plus className="size-6" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3">{t("emptyTitle")}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
            {t("emptyDesc")}
          </p>

          {hasNoCredits ? (
            <div className="space-y-3">
              <p className="text-sm text-amber-600 font-medium">
                {t("creditsNeeded")}
              </p>
              {onUpgrade && (
                <Button onClick={onUpgrade} size="lg" className="rounded-full">
                  {t("upgrade")}
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={onCreateNew}
              size="lg"
              className="rounded-full px-8 h-12 text-base shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="size-5 mr-2" />
              {t("startFree")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("count", { count: resumes.length })}
          </p>
        </div>
        {hasNoCredits ? (
          onUpgrade && <Button onClick={onUpgrade}>{t("upgrade")}</Button>
        ) : (
          <Button onClick={onCreateNew}>
            <Plus className="size-4" />
            {t("createNew")}
          </Button>
        )}
      </div>

      {hasNoCredits && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            ⚠️ {t("creditsNeeded")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {resumes.map((resume) => {
          // Use step config if available, fallback to status
          const config =
            (stepConfig as any)[resume.currentStep] ||
            (statusConfig as any)[resume.status];

          const isItemDeleting = deletingId === resume.id;

          return (
            <div
              key={resume.id}
              onClick={() => !isItemDeleting && onSelectResume(resume.id)}
              className={`relative w-full bg-card border border-border rounded-lg p-4 transition-all text-left ${
                isItemDeleting
                  ? "opacity-80"
                  : "hover:border-foreground/20 hover:shadow-sm cursor-pointer group"
              }`}
            >
              {isItemDeleting && (
                <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center z-10 transition-opacity">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 truncate">
                      {resume.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("lastModified")}:{" "}
                      {new Date(resume.updatedAt).toLocaleDateString(
                        locale === "ko" ? "ko-KR" : "en-US"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {onDelete && !isItemDeleting && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0 -mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(resume.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                if (deleteId && onDelete) {
                  // Close modal immediately and show loading on item
                  const idToDelete = deleteId;
                  setDeleteId(null);
                  setDeletingId(idToDelete);

                  try {
                    await onDelete(idToDelete);
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setDeletingId(null);
                  }
                }
              }}
            >
              {t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
