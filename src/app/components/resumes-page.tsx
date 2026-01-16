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

export function ResumesPage({
  resumes,
  onCreateNew,
  onSelectResume,
  onDelete,
  quota = 0,
  onUpgrade,
  showBetaBanner,
}: ResumesPageProps) {
  const stepConfig = {
    UPLOAD: { label: "Uploading", variant: "secondary" as const },
    PROCESSING: { label: "Analyzing", variant: "secondary" as const },
    EDIT: { label: "Editing", variant: "outline" as const },
    TEMPLATE: { label: "Choosing Template", variant: "outline" as const },
    COMPLETED: { label: "Completed", variant: "success" as const },
  };

  const statusConfig = {
    IDLE: { label: "Uploading", variant: "outline" as const },
    SUMMARIZED: { label: "Analyzing", variant: "secondary" as const },
    TRANSLATED: { label: "Analyzing", variant: "secondary" as const },
    COMPLETED: { label: "Completed", variant: "success" as const },
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

          <h2 className="text-2xl font-bold mb-3">
            Complete your first English resume
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Upload your Korean resume and AI will finish analysis, translation,
            and formatting in 5 minutes.
          </p>

          {hasNoCredits ? (
            <div className="space-y-4">
              <p className="text-sm text-destructive font-medium">
                Not enough credits to create a new resume
              </p>
              {onUpgrade && (
                <Button onClick={onUpgrade} variant="default">
                  Upgrade Plan
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={onCreateNew} size="lg">
              <Plus className="size-4 mr-2" />
              Start for Free
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl mb-1">Manage Resumes</h1>
          <p className="text-sm text-muted-foreground">
            {resumes.length} Resumes
          </p>
        </div>
        <Button onClick={onCreateNew} disabled={hasNoCredits} className="gap-2">
          <Plus className="size-4" />
          Create New Resume
        </Button>
      </div>

      {hasNoCredits && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            ⚠️ Not enough credits to create a new resume.{" "}
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="underline font-medium hover:no-underline"
              >
                Upgrade Plan
              </button>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {resumes.map((resume) => {
          const config = stepConfig[resume.currentStep] || stepConfig.UPLOAD;
          const isDeleting = deletingId === resume.id;

          return (
            <div
              key={resume.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => !isDeleting && onSelectResume(resume.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{resume.title}</h3>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last modified{" "}
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(resume.id);
                    }}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
