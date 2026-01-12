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
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

interface Education {
  id: string;
  school_name: string;
  school_name_en?: string;
  major: string;
  major_en?: string;
  degree: string;
  degree_en?: string;
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
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;

      const containerWidth = previewContainerRef.current.offsetWidth;
      // 210mm in pixels (assuming 96dpi, but React-PDF uses points)
      // Browsers generally use 96px per inch. 210mm = 8.27 inches.
      // 8.27 * 96 = 794px approximately.
      const a4WidthPx = 794;

      // We want some padding, so let's use 95% of container width
      const newScale = (containerWidth * 0.95) / a4WidthPx;
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
      description: "깔끔하고 현대적인 디자인. IT/스타트업 추천",
      isPro: false,
    },
    {
      id: "professional",
      name: "Professional",
      description: "2단 레이아웃으로 전문적인 느낌. 경력직 추천",
      isPro: true,
    },
    {
      id: "executive",
      name: "Executive",
      description: "강렬한 헤더와 고급스러운 디자인. 리더/임원급 추천",
      isPro: true,
    },
    {
      id: "classic",
      name: "Classic",
      description: "전통적이고 격식있는 스타일. 대기업/금융 추천",
      isPro: true,
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "미니멀하고 세련된 느낌. 디자인/크리에이티브 추천",
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">템플릿 선택</h1>
        <p className="text-sm text-muted-foreground">
          원하는 템플릿을 선택하세요
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground/30 bg-card"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <div className="flex items-center gap-2">
                    {template.isPro && (
                      <Badge variant="default" className="text-xs">
                        이용권 전용
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

          {/* PRO 템플릿 선택 시 업그레이드 안내 */}
          {isProTemplateSelected && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400">
                ⭐ 이 템플릿은 이용권 전용입니다. 아래 버튼을 눌러
                업그레이드하세요.
              </p>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <Button variant="outline" onClick={onBack} className="w-full">
              이전
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
                  처리 중...
                </>
              ) : isProTemplateSelected ? (
                "이용권 구매하기"
              ) : (
                "완료"
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              💡 <strong>팁:</strong> 템플릿은 각각 다른 느낌과 용도에
              최적화되어 있습니다. 지원하려는 회사와 포지션에 맞는 템플릿을
              선택하세요.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            ref={previewContainerRef}
            className="bg-muted/30 border border-border rounded-lg overflow-hidden flex justify-center py-8"
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
    </div>
  );
}
