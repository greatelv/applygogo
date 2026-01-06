import { useEffect, useState } from "react";
import { Loader2, FileText, Languages, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ProcessingPageProps {
  resumeTitle: string;
  onComplete: () => void;
}

export function ProcessingPage({ resumeTitle, onComplete }: ProcessingPageProps) {
  const [currentPhase, setCurrentPhase] = useState<"parsing" | "summarizing" | "translating" | "done">("parsing");

  useEffect(() => {
    // 단계별 진행 시뮬레이션
    const timers: NodeJS.Timeout[] = [];

    // 2초 후 텍스트 추출 완료
    timers.push(
      setTimeout(() => {
        setCurrentPhase("summarizing");
      }, 2000)
    );

    // 4초 후 AI 분석 완료
    timers.push(
      setTimeout(() => {
        setCurrentPhase("translating");
      }, 4000)
    );

    // 6초 후 요약 완료
    timers.push(
      setTimeout(() => {
        setCurrentPhase("done");
      }, 6000)
    );

    // 7초 후 다음 단계로 이동
    timers.push(
      setTimeout(() => {
        onComplete();
      }, 7000)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [onComplete]);

  const processingSteps = [
    {
      id: "parsing",
      label: "PDF 파싱",
      icon: FileText,
      description: "이력서 텍스트 추출 중...",
    },
    {
      id: "summarizing",
      label: "AI 요약",
      icon: Loader2,
      description: "경력사항 요약 중...",
    },
    {
      id: "translating",
      label: "영문 번역",
      icon: Languages,
      description: "영어로 번역 중...",
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ["parsing", "summarizing", "translating"];
    const currentStepIndex = stepOrder.indexOf(currentPhase);
    const thisStepIndex = stepOrder.indexOf(stepId);

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

        {currentPhase === "done" && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              분석이 완료되었습니다! 다음 단계로 이동합니다...
            </p>
            <Button onClick={onComplete}>
              요약 확인하기
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> AI가 경력사항을 불릿 포인트 3~4개로 요약합니다. 
          다음 단계에서 직접 수정할 수 있습니다.
        </p>
      </div>
    </div>
  );
}