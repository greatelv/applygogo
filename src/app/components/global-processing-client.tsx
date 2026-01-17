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
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
// import { useApp } from "@/app/context/app-context"; // Optional, remove if not used in global
import { Locale, t } from "@/lib/i18n-utils";
import { processGlobalResumeAction } from "@/lib/global-actions";

interface Props {
  resumeId: string;
  locale: Locale;
}

type ProcessingPhase =
  | "uploading"
  | "extracting"
  | "refining"
  | "translating"
  | "done";

export function GlobalProcessingClient({ resumeId, locale }: Props) {
  const router = useRouter();
  // const { setWorkflowState } = useApp(); // Might not be available in global context yet
  const [currentPhase, setCurrentPhase] =
    useState<ProcessingPhase>("uploading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const analyzeResume = async () => {
      try {
        // Phase 1: Upload complete
        if (!isMounted) return;
        setCurrentPhase("uploading");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Start Actual Background Task
        // We trigger the server action, but we update UI steps artificially
        // to match experience since the action is monolithic.
        const processPromise = processGlobalResumeAction(resumeId);

        if (!isMounted) return;
        // Phase 2: Extraction (Visual Update)
        setCurrentPhase("extracting");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate time

        if (!isMounted) return;
        // Phase 3: Refining (Visual Update)
        setCurrentPhase("refining");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate time

        if (!isMounted) return;
        // Phase 4: Translation (Visual Update)
        setCurrentPhase("translating");

        // Wait for actual completion
        const result = await processPromise;

        if (!isMounted) return;

        if (result.success) {
          // Phase 5: Done
          setCurrentPhase("done");
          setTimeout(() => {
            if (isMounted) {
              router.push(`/${locale}/resumes/${resumeId}/edit`);
            }
          }, 1500);
        } else {
          throw new Error(result.error);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An error occurred during processing.");
        }
      }
    };

    analyzeResume();

    return () => {
      isMounted = false;
    };
  }, [resumeId, locale, router]);

  // Localized Step Labels
  const processingSteps = [
    {
      id: "uploading",
      label: locale === "ko" ? "업로드 완료" : "Upload Complete",
      icon: Upload,
      description:
        locale === "ko" ? "이력서 PDF 업로드 완료" : "Resume PDF uploaded",
    },
    {
      id: "extracting",
      label: locale === "ko" ? "1단계: 추출" : "Step 1: Extraction",
      icon: FileText,
      description:
        locale === "ko"
          ? "PDF에서 텍스트 추출 중..."
          : "Extracting text from PDF...",
      detail:
        locale === "ko"
          ? "레이아웃과 내용을 분석합니다"
          : "Analyzing layout and content",
    },
    {
      id: "refining",
      label: locale === "ko" ? "2단계: 정제" : "Step 2: Refinement",
      icon: Filter,
      description:
        locale === "ko"
          ? "핵심 경력 선별 중..."
          : "Refining key experiences...",
      detail:
        locale === "ko"
          ? "가장 중요한 성과를 식별합니다"
          : "Identifying key achievements",
    },
    {
      id: "translating",
      label: locale === "ko" ? "3단계: 번역" : "Step 3: Translation",
      icon: Languages,
      description:
        locale === "ko"
          ? "글로벌 스탠다드로 번역 중..."
          : "Translating to Global Standard...",
      detail:
        locale === "ko"
          ? "Action Verb를 사용하여 번역합니다"
          : "Translating with Action Verbs",
    },
    {
      id: "done",
      label: locale === "ko" ? "완료" : "Done",
      icon: CheckCircle,
      description:
        locale === "ko" ? "AI 분석이 완료되었습니다!" : "AI Analysis Complete!",
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl mb-2 font-bold">
          {locale === "ko" ? "AI 처리" : "AI Processing"}
        </h1>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {locale === "ko"
              ? "AI가 이력서를 정밀 분석하여 글로벌 스탠다드에 맞는 영문 이력서로 재구성하고 있습니다."
              : "AI is analyzing your resume to restructure it into a global standard English resume."}
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-600/90 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
            <span className="text-lg">⚠️</span>
            <p>
              {locale === "ko"
                ? "작업이 진행되는 동안 페이지를 유지해 주세요."
                : "Please stay on this page while processing."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
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
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
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
                  <span className="text-xs text-green-600 dark:text-green-400 pt-1 font-medium">
                    {locale === "ko" ? "완료" : "Done"}
                  </span>
                )}
                {status === "processing" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 pt-1 font-medium">
                    {locale === "ko" ? "진행중" : "In Progress"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              {locale === "ko" ? "오류 발생" : "Error Occurred"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/${locale}/resumes/new`)}
              className="bg-background"
            >
              {locale === "ko" ? "다시 업로드" : "Try Upload Again"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
