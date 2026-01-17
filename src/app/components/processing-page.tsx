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
import { useApp } from "@/app/context/app-context";

const steps = [
  { id: "upload", label: "업로드" },
  { id: "processing", label: "AI 처리" },
  { id: "edit", label: "편집" },
  { id: "preview", label: "템플릿 선택" },
  { id: "complete", label: "완료" },
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
  const { setWorkflowState, plan } = useApp();
  const [currentPhase, setCurrentPhase] =
    useState<ProcessingPhase>("uploading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWorkflowState(steps, "processing");
    return () => setWorkflowState(undefined, undefined);
  }, [setWorkflowState]);

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
        // Phase 2: Extraction (1단계 API 호출)
        // ================================================================
        setCurrentPhase("extracting");

        const extractResponse = await fetch(
          `/api/resumes/${resumeId}/extract`,
          { method: "POST" }
        );

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.error || "Extraction failed");
        }

        const { data: extractedData } = await extractResponse.json();

        if (isCancelled) return;

        // ================================================================
        // Phase 3: Refinement (2단계 API 호출)
        // ================================================================
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

        // ================================================================
        // Phase 4: Translation (3단계 API 호출)
        // ================================================================
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

        if (isCancelled) return;

        // ================================================================
        // Phase 5: Done
        // ================================================================
        setCurrentPhase("done");

        // Auto-proceed after showing completion
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
          setError(err.message || "분석 중 오류가 발생했습니다.");
        }
      }
    };

    analyzeResume();

    return () => {
      isCancelled = true;
    };
  }, [resumeId, onComplete, router]);

  // 3단계 AI 프로세싱 UI (추출 → 정제 → 번역)
  const processingSteps = [
    {
      id: "uploading",
      label: "업로드 완료",
      icon: Upload,
      description: "이력서 PDF 업로드 완료",
    },
    {
      id: "extracting",
      label: "1단계: 추출",
      icon: FileText,
      description: "PDF에서 한글 원문을 정확하게 추출 중...",
      detail: "회사명, 학교명 등 고유명사를 그대로 추출합니다",
    },
    {
      id: "refining",
      label: "2단계: 정제",
      icon: Filter,
      description: "한글 기준으로 핵심 경력 선별 중...",
      detail: "가장 임팩트 있는 성과를 3~5개로 선별합니다",
    },
    {
      id: "translating",
      label: "3단계: 번역",
      icon: Languages,
      description: "선별된 한글을 영문으로 번역 중...",
      detail: "Action Verb를 사용하여 성과 중심으로 번역합니다",
    },
    {
      id: "done",
      label: "완료",
      icon: CheckCircle,
      description: "AI 분석이 완료되었습니다!",
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
        <h1 className="text-2xl mb-2">AI 처리</h1>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            AI가 회원님의 이력서를 정밀 분석하여 글로벌 스탠다드에 맞는 영문
            이력서로 재구성하고 있습니다.
            <br />
            텍스트 추출부터 핵심 성과 선별, 전문 번역까지 정교한 작업이 진행되니
            잠시만 기다려 주세요.
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-600/90 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
            <span className="text-lg">⚠️</span>
            <p>
              안정적인 분석 처리를 위해 <strong>화면을 유지해 주세요.</strong>{" "}
              (페이지 이탈 시 작업이 중단될 수 있습니다)
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
                    완료
                  </span>
                )}
                {status === "processing" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 pt-1">
                    진행중
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
                        크레딧이 부족합니다
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        AI 이력서 분석을 진행하기 위해 필요한 크레딧이
                        부족합니다.
                        <br />
                        결제를 통해 크레딧을 충전하고 분석을 완료해보세요.
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
                          이용권 구매하고 무제한 이용하기
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/settings#payment-section")}
                        className="w-full h-11"
                      >
                        크레딧 충전하기
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 p-4 flex justify-between items-center border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    결제 후 작업을 다시 시도할 수 있습니다.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.replace("/resumes")}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    목록으로 돌아가기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  오류 발생
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
                  다시 업로드하기
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPhase === "done" && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              분석이 완료되었습니다! 다음 단계로 이동합니다...
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
                  처리 중...
                </>
              ) : (
                "요약 확인하기"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>3단계 AI 프로세싱</strong>: 각 단계별로 실제 처리 시간이
          반영됩니다. 한글 기준으로 먼저 핵심 경력을 선별한 후 번역하여 더
          정확하고 효율적인 결과를 제공합니다.
        </p>
      </div>
    </div>
  );
}
