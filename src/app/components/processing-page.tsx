"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Languages,
  CheckCircle,
  Upload,
  Filter,
  Sparkles,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { useApp } from "../context/app-context";

const stepsList = [
  { id: "upload", labelKey: "workflow.upload" },
  { id: "processing", labelKey: "workflow.processing" },
  { id: "edit", labelKey: "workflow.edit" },
  { id: "preview", labelKey: "workflow.template" },
  { id: "complete", labelKey: "workflow.complete" },
];

interface ProcessingPageProps {
  resumeTitle: string;
  resumeId: string | null;
  onComplete?: () => void;
  isCompleting?: boolean;
}

type ProcessingPhase =
  | "uploading"
  | "extracting"
  | "refining"
  | "translating"
  | "done";

export function ProcessingPage({
  resumeTitle,
  resumeId,
  onComplete,
  isCompleting = false,
}: ProcessingPageProps) {
  const router = useRouter();
  const t = useTranslations("processingPage");
  const tRoot = useTranslations();
  const { setWorkflowState, plan } = useApp();
  const [currentPhase, setCurrentPhase] =
    useState<ProcessingPhase>("uploading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const steps = stepsList.map((s) => ({
      id: s.id,
      label: tRoot(s.labelKey as any),
    }));
    setWorkflowState(steps, "processing");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, tRoot]);

  useEffect(() => {
    if (!resumeId) {
      setError("Resume ID is missing");
      return;
    }

    let isCancelled = false;

    const analyzeResume = async () => {
      try {
        setCurrentPhase("uploading");
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (isCancelled) return;

        // Phase 2: Extraction
        setCurrentPhase("extracting");
        const extractResponse = await fetch(
          `/api/resumes/${resumeId}/extract`,
          { method: "POST" },
        );

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.error || "Extraction failed");
        }

        const { data: extractedData } = await extractResponse.json();
        if (isCancelled) return;

        // Phase 3: Refinement
        setCurrentPhase("refining");
        const refineResponse = await fetch(`/api/resumes/${resumeId}/refine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedData }),
        });

        if (!refineResponse.ok) {
          const errorData = await refineResponse.json();
          throw new Error(errorData.error || "Refinement failed");
        }

        const { data: refinedData } = await refineResponse.json();
        if (isCancelled) return;

        // Phase 4: Translation
        setCurrentPhase("translating");
        const translateResponse = await fetch(
          `/api/resumes/${resumeId}/translate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refinedData }),
          },
        );

        if (!translateResponse.ok) {
          const errorData = await translateResponse.json();
          throw new Error(errorData.error || "Translation failed");
        }

        if (isCancelled) return;

        // Phase 5: Done
        setCurrentPhase("done");

        setTimeout(() => {
          if (!isCancelled) {
            if (onComplete) {
              onComplete();
            } else if (resumeId) {
              router.replace(`/resumes/${resumeId}/edit`);
            }
          }
        }, 1500);
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "An error occurred during analysis.");
        }
      }
    };

    analyzeResume();

    return () => {
      isCancelled = true;
    };
  }, [resumeId, onComplete, router]);

  const processingSteps = [
    {
      id: "uploading",
      label: t("steps.uploading.label"),
      icon: Upload,
      description: t("steps.uploading.description"),
    },
    {
      id: "extracting",
      label: t("steps.extracting.label"),
      icon: FileText,
      description: t("steps.extracting.description"),
      detail: t("steps.extracting.tip"),
    },
    {
      id: "refining",
      label: t("steps.refining.label"),
      icon: Filter,
      description: t("steps.refining.description"),
      detail: t("steps.refining.tip"),
    },
    {
      id: "translating",
      label: t("steps.translating.label"),
      icon: Languages,
      description: t("steps.translating.description"),
      detail: t("steps.translating.tip"),
    },
    {
      id: "done",
      label: t("steps.done.label"),
      icon: CheckCircle,
      description: t("steps.done.description"),
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder: ProcessingPhase[] = [
      "uploading",
      "extracting",
      "refining",
      "translating",
      "done",
    ];
    const currentStepIndex = stepOrder.indexOf(currentPhase);
    const thisStepIndex = stepOrder.indexOf(stepId as ProcessingPhase);

    if (currentPhase === "done") return "completed";
    if (thisStepIndex < currentStepIndex) return "completed";
    if (thisStepIndex === currentStepIndex) return "processing";
    return "pending";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">{t("title")}</h1>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t.rich("description", {
              br: () => <br />,
            })}
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-600/90 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
            <span className="text-lg">⚠️</span>
            <p>
              {t.rich("warning", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-8">
        <div className="space-y-6">
          {processingSteps.map((step) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {status === "completed" ? (
                    <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : status === "processing" ? (
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Loader2 className="size-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <p
                    className={`font-medium mb-1 ${
                      status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {status === "processing" && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {step.detail && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          💡 {step.detail}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {status === "completed" && (
                  <span className="text-xs text-green-600 dark:text-green-400 pt-1">
                    {t("status.completed")}
                  </span>
                )}
                {status === "processing" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 pt-1">
                    {t("status.processing")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-8 pt-6 border-t border-border">
            {error.includes("크레딧") ||
            error.toLowerCase().includes("credit") ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
                      <Sparkles className="size-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {t("error.credits.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t.rich("error.credits.description", {
                          br: () => <br />,
                        })}
                      </p>
                    </div>
                  </div>

                  {plan === "FREE" ? (
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/settings#payment-section")}
                        className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md border-0"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="size-4" />
                          {t("error.credits.buyPass")}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/settings#payment-section")}
                        className="w-full h-11"
                      >
                        {t("error.credits.refill")}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 p-4 flex justify-between items-center border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {t("error.credits.footer")}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.replace("/resumes")}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    {t("error.credits.backToList")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {t("error.title")}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.replace("/resumes/new")}
                  className="bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  {t("error.retry")}
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPhase === "done" && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("doneSection.message")}
            </p>
            <Button
              onClick={() => {
                if (onComplete) {
                  onComplete();
                } else if (resumeId) {
                  router.replace(`/resumes/${resumeId}/edit`);
                }
              }}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("doneSection.processing")}
                </>
              ) : (
                t("doneSection.button")
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          {t.rich("footerTip", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>
    </div>
  );
}
