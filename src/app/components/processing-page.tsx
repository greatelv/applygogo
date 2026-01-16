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

const steps = [
  { id: "upload", label: "Upload" },
  { id: "processing", label: "AI Processing" },
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Selection" },
  { id: "complete", label: "Complete" },
];

interface ProcessingPageProps {
  resumeTitle: string;
  resumeId: string | null;
  onComplete?: () => void;
  isCompleting?: boolean;
}

// 3-phase AI processing (Extract → Refine → Translate)
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
  const [sourceLang, setSourceLang] = useState<string>("ko");

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
        // Phase 2: Extraction
        // ================================================================
        setCurrentPhase("extracting");

        const extractResponse = await fetch(
          `/api/resumes/${resumeId}/extract`,
          { method: "POST" }
        );

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.error || "Error Occurred");
        }

        const { data: extractedData } = await extractResponse.json();
        const detectedLanguage =
          extractedData.metadata?.detected_language || "ko";
        setSourceLang(detectedLanguage);

        if (isCancelled) return;

        // ================================================================
        // Phase 3: Refinement (source language)
        // ================================================================
        setCurrentPhase("refining");

        const refineResponse = await fetch(`/api/resumes/${resumeId}/refine`, {
          method: "POST",
        });

        if (!refineResponse.ok) {
          const errorData = await refineResponse.json();
          throw new Error(errorData.error || "Error Occurred");
        }

        if (isCancelled) return;

        // ================================================================
        // Phase 4: Translation
        // ================================================================
        setCurrentPhase("translating");

        const translateResponse = await fetch(
          `/api/resumes/${resumeId}/translate`,
          { method: "POST" }
        );

        if (!translateResponse.ok) {
          const errorData = await translateResponse.json();
          throw new Error(errorData.error || "Error Occurred");
        }

        if (isCancelled) return;

        // ================================================================
        // Complete
        // ================================================================
        setCurrentPhase("done");

        // Wait a moment before transitioning
        setTimeout(() => {
          if (!isCancelled && onComplete) {
            onComplete();
          }
        }, 1500);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Processing error:", err);
          setError(err.message || "Error Occurred");
        }
      }
    };

    analyzeResume();

    return () => {
      isCancelled = true;
    };
  }, [resumeId, onComplete, router]);

  // Dynamic UI steps based on sourceLang
  const isEnSource = sourceLang === "en";

  const processingSteps = [
    {
      id: "uploading",
      label: "Upload Complete",
      icon: Upload,
      description: "Resume PDF upload finished",
    },
    {
      id: "extracting",
      label: "Phase 1: Extraction",
      icon: FileText,
      description: "Extracting the original text accurately from PDF...",
      detail:
        "Extracting proper nouns like company and school names exactly as they appear",
    },
    isEnSource
      ? {
          id: "translating",
          label: "Phase 2: Translation",
          icon: Languages,
          description:
            "Translating English into Korean for the local market...",
          detail: "Localized translation suitable for the Korean job market",
        }
      : {
          id: "refining",
          label: "Phase 2: Refinement",
          icon: Filter,
          description:
            "Selecting key achievements based on the source language...",
          detail: "Selecting the 3-5 most impactful achievements",
        },
    isEnSource
      ? {
          id: "refining",
          label: "Phase 3: Refinement",
          icon: Filter,
          description: "Refining for the Korean market...",
          detail: "Optimizing expressions for Korean recruitment standards",
        }
      : {
          id: "translating",
          label: "Phase 3: Translation",
          icon: Languages,
          description: "Translating the selected text...",
          detail: "Translating into professional English using Action Verbs",
        },
    {
      id: "done",
      label: "Complete",
      icon: CheckCircle,
      description: "AI analysis is complete!",
    },
  ];

  const currentStepIndex = processingSteps.findIndex(
    (step) => step.id === currentPhase
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-card border border-destructive/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Sparkles className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-destructive">
                  Error Occurred
                </h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/resumes")}
              variant="outline"
              className="w-full"
            >
              Upload Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full mx-auto p-8">
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">AI Processing</h1>
            <p className="text-sm text-muted-foreground">
              AI is meticulously analyzing your resume and reconstructing it
              into a professional format optimized for the global/local market.
              <br />
              Please wait as we extract text, select key achievements, and
              perform specialized translation.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              ⚠️ Please keep this page open to ensure stable processing.
              (Closing may interrupt the task)
            </p>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`
                    relative flex gap-4 p-4 rounded-lg border transition-all
                    ${
                      isActive
                        ? "bg-primary/5 border-primary/30 shadow-sm"
                        : isCompleted
                        ? "bg-muted/30 border-border/50"
                        : "bg-background border-border/30 opacity-50"
                    }
                  `}
                >
                  <div
                    className={`
                    size-12 rounded-full flex items-center justify-center shrink-0
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : isCompleted
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {isActive ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="size-6" />
                    ) : (
                      <Icon className="size-6" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{step.label}</h3>
                      {isActive && (
                        <span className="text-xs text-primary font-medium">
                          Processing...
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {step.detail && isActive && (
                      <p className="text-xs text-muted-foreground/80 italic">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Tip:</strong> 3-Phase AI Processing: Reflects actual
              processing time for each stage. We select key achievements based
              on the source language before translation for the most accurate
              and efficient results.
            </p>
          </div>

          {/* Done State */}
          {currentPhase === "done" && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                <CheckCircle className="size-5" />
                <span className="font-medium">
                  Analysis is complete! Moving to the next step...
                </span>
              </div>
              <Button
                onClick={onComplete}
                disabled={isCompleting}
                className="w-full"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "View Summary"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
