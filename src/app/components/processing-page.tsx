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
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useApp } from "../context/app-context";
import { useTranslations, useLocale } from "next-intl";

const steps = [
  { id: "upload", label: { ko: "업로드", en: "Upload" } },
  { id: "processing", label: { ko: "AI 처리", en: "AI Processing" } },
  { id: "edit", label: { ko: "편집", en: "Edit" } },
  { id: "preview", label: { ko: "템플릿 선택", en: "Selection" } },
  { id: "complete", label: { ko: "완료", en: "Complete" } },
];

interface ProcessingPageProps {
  resumeTitle: string;
  resumeId: string | null;
  onComplete?: () => void;
  isCompleting?: boolean;
}

// 3단계 AI 프로세싱 단계 (추출 → 정제 → 번역)
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
  const t = useTranslations("Processing");
  const locale = useLocale();
  const { setWorkflowState, plan } = useApp();
  const [currentPhase, setCurrentPhase] =
    useState<ProcessingPhase>("uploading");
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState<string>("ko");

  useEffect(() => {
    const localizedSteps = steps.map((s) => ({
      id: s.id,
      label: s.label[locale as keyof typeof s.label] || s.label.ko,
    }));
    setWorkflowState(localizedSteps, "processing");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState, locale]);

  useEffect(() => {
    if (!resumeId) {
      setError("Resume ID is missing");
      return;
    }

    let isCancelled = false;

    const analyzeResume = async () => {
      try {
        // Phase 1: Upload complete (already done)
        setCurrentPhase("uploading");
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (isCancelled) return;

        // ================================================================
        // Phase 2: Extraction
        // ================================================================
        setCurrentPhase("extracting");

        const extractResponse = await fetch(
          `/api/resumes/${resumeId}/extract`,
          { method: "POST" }
        );

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.error || t("error_title"));
        }

        const { data: extractedData } = await extractResponse.json();
        const detectedLanguage =
          extractedData.metadata?.detected_language || "ko";
        setSourceLang(detectedLanguage);

        if (isCancelled) return;

        if (detectedLanguage === "en") {
          // ================================================================
          // Track B (Global): Translate -> Refine
          // ================================================================
          setCurrentPhase("translating");
          const translateResponse = await fetch(
            `/api/resumes/${resumeId}/translate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refinedData: extractedData }),
            }
          );

          if (!translateResponse.ok) {
            const errorData = await translateResponse.json();
            throw new Error(errorData.error || "Translation failed");
          }

          const { data: translatedData } = await translateResponse.json();
          if (isCancelled) return;

          setCurrentPhase("refining");
          const refineResponse = await fetch(
            `/api/resumes/${resumeId}/refine`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                extractedData: translatedData,
                saveToDb: true,
              }),
            }
          );

          if (!refineResponse.ok) {
            const errorData = await refineResponse.json();
            throw new Error(errorData.error || "Refinement failed");
          }
        } else {
          // ================================================================
          // Track A (Standard): Refine -> Translate
          // ================================================================
          setCurrentPhase("refining");
          const refineResponse = await fetch(
            `/api/resumes/${resumeId}/refine`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ extractedData }),
            }
          );

          if (!refineResponse.ok) {
            const errorData = await refineResponse.json();
            throw new Error(errorData.error || "Refinement failed");
          }

          const { data: refinedData } = await refineResponse.json();
          if (isCancelled) return;

          setCurrentPhase("translating");
          const translateResponse = await fetch(
            `/api/resumes/${resumeId}/translate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refinedData }),
            }
          );

          if (!translateResponse.ok) {
            const errorData = await translateResponse.json();
            throw new Error(errorData.error || "Translation failed");
          }
        }

        if (isCancelled) return;

        // ================================================================
        // Final Phase: Done
        // ================================================================
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
          setError(err.message || t("error_title"));
        }
      }
    };

    analyzeResume();

    return () => {
      isCancelled = true;
    };
  }, [resumeId, onComplete, router, t]);

  // Dynamic UI steps based on sourceLang
  const isEnSource = sourceLang === "en";

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
      detail: t("steps.extracting.detail"),
    },
    isEnSource
      ? {
          id: "translating",
          label: t("steps.translating_en_ko.label"),
          icon: Languages,
          description: t("steps.translating_en_ko.description"),
          detail: t("steps.translating_en_ko.detail"),
        }
      : {
          id: "refining",
          label: t("steps.refining.label"),
          icon: Filter,
          description: t("steps.refining.description"),
          detail: t("steps.refining.detail"),
        },
    isEnSource
      ? {
          id: "refining",
          label: t("steps.refining_target.label"),
          icon: Filter,
          description: t("steps.refining_target.description"),
          detail: t("steps.refining_target.detail"),
        }
      : {
          id: "translating",
          label: t("steps.translating.label"),
          icon: Languages,
          description: t("steps.translating.description"),
          detail: t("steps.translating.detail"),
        },
    {
      id: "done",
      label: t("steps.done.label"),
      icon: CheckCircle,
      description: t("steps.done.description"),
    },
  ];

  const getStepStatus = (stepId: string) => {
    // Note: status check order should technically follow the flow,
    // but Phase IDs are enough here as long as we track the currentPhase accurately.
    const stepOrder: ProcessingPhase[] = isEnSource
      ? ["uploading", "extracting", "translating", "refining", "done"]
      : ["uploading", "extracting", "refining", "translating", "done"];

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
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {t("description")}
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-600/90 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
            <span className="text-lg">⚠️</span>
            <p className="whitespace-pre-line">{t("warning")}</p>
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
                    {locale === "ko" ? "완료" : "Done"}
                  </span>
                )}
                {status === "processing" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 pt-1">
                    {locale === "ko" ? "진행중" : "Processing"}
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
                        {t("error_title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {locale === "ko"
                          ? "AI 이력서 분석을 진행하기 위해 필요한 크레딧이 부족합니다.\n결제를 통해 크레딧을 충전하고 분석을 완료해보세요."
                          : "You don't have enough credits to proceed with AI analysis.\nPlease recharge your credits to complete the process."}
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
                          {locale === "ko"
                            ? "이용권 구매하고 무제한 이용하기"
                            : "Buy a Pass for Unlimited Access"}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/settings#payment-section")}
                        className="w-full h-11"
                      >
                        {locale === "ko" ? "크레딧 충전하기" : "Buy Credits"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 p-4 flex justify-between items-center border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {locale === "ko"
                      ? "결제 후 작업을 다시 시도할 수 있습니다."
                      : "You can retry after purchase."}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.replace("/resumes")}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    {locale === "ko" ? "목록으로 돌아가기" : "Back to List"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {t("error_title")}
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
                  {t("retry")}
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPhase === "done" && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("done_message")}
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
                  {t("processing")}
                </>
              ) : (
                t("view_summary")
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 {t("tip")}
        </p>
      </div>
    </div>
  );
}
