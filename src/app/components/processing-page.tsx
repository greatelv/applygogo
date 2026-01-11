import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Languages,
  CheckCircle,
  Upload,
  Filter,
} from "lucide-react";
import { Button } from "./ui/button";

interface ProcessingPageProps {
  resumeTitle: string;
  resumeId: string | null;
  onComplete: () => void;
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
  const [currentPhase, setCurrentPhase] =
    useState<ProcessingPhase>("uploading");
  const [error, setError] = useState<string | null>(null);

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
          if (!isCancelled) onComplete();
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
  }, [resumeId, onComplete]);

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
        <p className="text-sm text-muted-foreground">
          이력서를 3단계로 분석하고 있습니다: 추출 → 정제 → 번역
        </p>
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
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">오류 발생</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {currentPhase === "done" && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              분석이 완료되었습니다! 다음 단계로 이동합니다...
            </p>
            <Button onClick={onComplete} disabled={isCompleting}>
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
