import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Languages,
  CheckCircle,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";

interface ProcessingPageProps {
  resumeTitle: string;
  resumeId: string | null;
  onComplete: () => void;
}

type ProcessingPhase = "uploading" | "extracting" | "grouping" | "done";

export function ProcessingPage({
  resumeTitle,
  resumeId,
  onComplete,
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

        // Phase 2: Extraction + Translation
        setCurrentPhase("extracting");

        const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Analysis failed");
        }

        if (isCancelled) return;

        // Phase 3: Grouping + Selection (happens in backend, show for UX)
        setCurrentPhase("grouping");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isCancelled) return;

        // Phase 4: Done
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

  const processingSteps = [
    {
      id: "uploading",
      label: "업로드 완료",
      icon: Upload,
      description: "이력서 PDF 업로드 완료",
    },
    {
      id: "extracting",
      label: "추출 + 번역",
      icon: FileText,
      description: "PDF에서 경력사항 추출 및 영문 번역 중...",
    },
    {
      id: "grouping",
      label: "그룹화 + 선택",
      icon: Loader2,
      description: "회사별 그룹화 및 핵심 경력 선택 중...",
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
      "grouping",
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
          {resumeTitle} • 이력서를 분석하고 요약 및 번역하고 있습니다
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
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
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
            <Button onClick={onComplete}>요약 확인하기</Button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> AI가 경력사항을 불릿 포인트 3~4개로
          요약합니다. 다음 단계에서 직접 수정할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
