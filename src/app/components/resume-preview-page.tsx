import { useState, useRef, useEffect } from "react";
import { ArrowRight, Eye, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { ModernTemplate } from "./resume-templates/modern-template";
import { ClassicTemplate } from "./resume-templates/classic-template";
import { MinimalTemplate } from "./resume-templates/minimal-template";

interface TranslatedExperience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
  companyTranslated: string;
  positionTranslated: string;
  bulletsTranslated: string[];
}

interface Education {
  id: string;
  school_name: string;
  school_name_translated?: string;
  major: string;
  major_translated?: string;
  degree: string;
  degree_translated?: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

interface ResumePreviewPageProps {
  resumeTitle: string;
  personalInfo?: any;
  experiences: TranslatedExperience[];
  educations: Education[];
  skills: Skill[];
  additionalItems?: any[];
  currentPlan?: string;
  onNext?: (templateId: string) => void;
  onComplete?: () => void;
  onBack: () => void;
  onUpgrade?: () => void;
  initialTemplate?: string;
  isCompleting?: boolean;
}

export function ResumePreviewPage({
  resumeTitle,
  personalInfo,
  experiences,
  educations,
  skills,
  additionalItems = [],
  currentPlan = "FREE",
  onNext,
  onComplete,
  onBack,
  onUpgrade,
  initialTemplate = "modern",
  isCompleting = false,
}: ResumePreviewPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialTemplate.toLowerCase()
  );
  // Calculate initial scale based on window width
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;

      const containerWidth = previewContainerRef.current.offsetWidth;
      // 210mm in pixels (assuming 96dpi) -> 794px
      const a4WidthPx = 794;

      // Calculate scale to fit container width with 5% padding
      let newScale = (containerWidth * 0.95) / a4WidthPx;

      // Enforce minimum scale for mobile readability (approx 0.5)
      // This allows horizontal scrolling instead of shrinking too much
      if (window.innerWidth < 1024 && newScale < 0.55) {
        newScale = 0.55;
      }

      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ... (type Template and templates array remain same)
  type Template = {
    id: string;
    name: string;
    description: string;
    isPro: boolean;
  };

  const templates: Template[] = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and modern design. Recommended for IT/Startups",
      isPro: false,
    },
    {
      id: "professional",
      name: "Professional",
      description:
        "Two-column layout, professional look. Recommended for experienced hires",
      isPro: true,
    },
    {
      id: "executive",
      name: "Executive",
      description:
        "Bold header and premium design. Recommended for Executives/Leadership",
      isPro: true,
    },
    {
      id: "classic",
      name: "Classic",
      description:
        "Traditional and formal style. Recommended for Corporate/Finance",
      isPro: true,
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Minimalist and chic. Recommended for Design/Creative",
      isPro: true,
    },
  ];

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const isProTemplateSelected =
    selectedTemplateData?.isPro && currentPlan === "FREE";

  const handleNext = () => {
    // Premium 템플릿이 선택되었지만 사용자가 FREE 플랜인 경우
    if (isProTemplateSelected) {
      if (onUpgrade) {
        onUpgrade();
      }
      return;
    }

    if (onNext) {
      onNext(selectedTemplate);
    }
  };

  const renderTemplate = () => {
    const commonProps = {
      personalInfo,
      experiences,
      educations,
      skills,
      additionalItems,
    };

    switch (selectedTemplate) {
      case "classic":
        return <ClassicTemplate {...commonProps} />;
      case "minimal":
        return <MinimalTemplate {...commonProps} />;
      case "professional":
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {
          ProfessionalTemplate,
        } = require("./resume-templates/professional-template");
        return <ProfessionalTemplate {...commonProps} />;
      case "executive":
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {
          ExecutiveTemplate,
        } = require("./resume-templates/executive-template");
        return <ExecutiveTemplate {...commonProps} />;
      case "modern":
      default:
        return <ModernTemplate {...commonProps} />;
    }
  };

  const renderA4Preview = () => {
    return (
      <div
        className="bg-white shadow-2xl origin-top mx-auto"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {renderTemplate()}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Template Selection</h1>
        <p className="text-sm text-muted-foreground">
          Select a template for your resume
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          {/* Mobile: Tab-style Selection Grid */}
          <div className="lg:hidden grid grid-cols-5 gap-1 p-1 bg-muted/40 rounded-lg">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-0.5 rounded-md text-[10px] sm:text-xs font-medium transition-all relative overflow-hidden",
                  selectedTemplate === template.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                {/* Shortened Names for Mobile */}
                <span className="z-10 relative">
                  {template.id === "professional"
                    ? "Pro"
                    : template.id === "executive"
                    ? "Exec"
                    : template.name}
                </span>
                {selectedTemplate === template.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/50" />
                )}
              </button>
            ))}
          </div>

          {/* Selected Template Description for Mobile Context */}
          <div className="lg:hidden text-center py-2 px-4 mb-2">
            <h4 className="font-semibold text-sm mb-0.5">
              {templates.find((t) => t.id === selectedTemplate)?.name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {templates.find((t) => t.id === selectedTemplate)?.description}
            </p>
          </div>

          {/* Desktop: Original List Card Style */}
          <div className="hidden lg:block space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer relative",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground/30 bg-card"
                )}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <div className="flex items-center gap-2">
                    {template.isPro && (
                      <Badge variant="default" className="text-xs">
                        PRO
                      </Badge>
                    )}
                    {selectedTemplate === template.id && (
                      <CheckCircle className="size-5 text-primary" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </button>
            ))}
          </div>

          {/* PRO Template Selection 시 업그레이드 안내 */}
          {isProTemplateSelected && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400">
                ⭐ This template requires a paid pass.
              </p>
            </div>
          )}

          <div className="pt-4 space-y-2 hidden lg:block">
            <Button variant="outline" onClick={onBack} className="w-full">
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="w-full"
              size="lg"
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isProTemplateSelected ? (
                "Purchase Pass"
              ) : (
                "Complete"
              )}
            </Button>
          </div>

          <div className="hidden lg:block mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              💡 <strong>Tip:</strong> Each template is optimized for different
              styles and purposes. Choose the one that best fits the company and
              position you are applying for.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            ref={previewContainerRef}
            className="bg-muted/30 border border-border rounded-lg overflow-x-auto py-8"
          >
            <div
              className="overflow-visible"
              style={{
                width: "210mm",
                height: `${297 * scale}mm`, // Adjust parent height to match scaled content
                minHeight: "400px",
              }}
            >
              {renderA4Preview()}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 lg:hidden flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 text-base"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 h-12 text-base"
          size="lg"
          disabled={isCompleting}
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isProTemplateSelected ? (
            "Purchase"
          ) : (
            "Complete"
          )}
        </Button>
      </div>
    </div>
  );
}
