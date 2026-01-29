"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";

import { ModernPdf, registerFonts } from "./pdf-templates/modern-pdf";
import { ClassicPdf } from "./pdf-templates/classic-pdf";
import { MinimalPdf } from "./pdf-templates/minimal-pdf";
import { ProfessionalPdf } from "./pdf-templates/professional-pdf";
import { ExecutivePdf } from "./pdf-templates/executive-pdf";
import { PDFViewer, BlobProvider } from "@react-pdf/renderer";
import { AppLocale } from "@/lib/resume-language";

interface TemplatePreviewDialogProps {
  trigger?: React.ReactNode;
  onSelectTemplate: (template: string) => void;
}

const koUserMockData = {
  personalInfo: {
    name_source: "김지원",
    name_target: "Jiwon Kim",
    email: "jiwon.kim@example.com",
    phone: "010-1234-5678",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/jiwonkim" },
      { label: "Portfolio", url: "https://jiwonkim.dev" },
    ],
    summary_source:
      "7년차 시니어 소프트웨어 엔지니어로, 풀스택 개발 분야에서 풍부한 경험을 보유하고 있습니다. 확장 가능한 웹 애플리케이션의 설계 및 개발을 주도해 왔으며, React, Node.js 및 클라우드 인프라 활용에 능숙합니다. 깨끗하고 유지보수가 용이한 코드를 지향하며 기술을 통해 복잡한 비즈니스 문제를 해결하는 데 열정을 가지고 있습니다.",
    summary_target:
      "Senior Software Engineer with 7 years of experience in full-stack development. Led design and development of scalable web applications, proficient in React, Node.js, and cloud infrastructure. Passionate about clean, maintainable code and solving complex business problems through technology.",
  },
  experiences: [
    {
      id: "1",
      company_name_source: "글로벌 테크 솔루션",
      company_name_target: "Global Tech Solutions",
      role_source: "시니어 프론트엔드 엔지니어",
      role_target: "Senior Frontend Engineer",
      period: "2021.03 - 현재",
      bullets_source: [
        "핵심 이커머스 플랫폼의 리빌딩을 주도하여 로딩 속도를 40% 개선하고 사용자 유지율을 향상시킴.",
        "GitHub Actions를 이용한 자동화된 CI/CD 파이프라인을 구축하여 배포 시간을 60% 단축함.",
        "UX 디자이너와 협업하여 사용자 인터페이스를 전면 개편, 전환율을 25% 상승시키는 성과를 거둠.",
        "주니어 개발자 멘토링 및 코드 리뷰를 통해 전반적인 코드 품질 향상에 기여함.",
      ],
      bullets_target: [
        "Led the rebuilding of core e-commerce platform, improving loading speeds by 40% and user retention.",
        "Established automated CI/CD pipelines using GitHub Actions, reducing deployment time by 60%.",
        "Collaborated with UX designers to overhaul UI, achieving a 25% increase in conversion rates.",
        "Mentored junior developers and improved overall code quality through rigorous code reviews.",
      ],
    },
    {
      id: "2",
      company_name_source: "스타트업 이노베이션",
      company_name_target: "StartUp Innovations",
      role_source: "풀스택 개발자",
      role_target: "Full Stack Developer",
      period: "2018.06 - 2021.02",
      bullets_source: [
        "React와 Python/Django를 사용하여 다수의 고객 대응용 웹 애플리케이션을 개발 및 유지보수함.",
        "데이터베이스 쿼리 및 API 엔드포인트 최적화를 통해 평균 응답 시간을 300ms 단축함.",
        "제3자 결제 게이트웨이 및 인증 시스템을 통합하여 플랫폼 보안 및 수익 모델 강화에 기여함.",
      ],
      bullets_target: [
        "Developed and maintained various customer-facing web applications using React and Python/Django.",
        "Optimized DB queries and API endpoints, reducing average response time by 300ms.",
        "Integrated third-party payment gateways and authentication systems, strengthening platform security.",
      ],
    },
  ],
  educations: [
    {
      id: "1",
      school_name_source: "고려대학교",
      school_name_target: "Korea University",
      degree_source: "학사",
      degree_target: "Bachelor of Science",
      major_source: "컴퓨터공학",
      major_target: "Computer Science",
      start_date: "2014.03",
      end_date: "2018.02",
    },
  ],
  skills: [
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "Node.js" },
    { id: "4", name: "Next.js" },
    { id: "5", name: "AWS" },
    { id: "6", name: "Docker" },
  ],
  additionalItems: [
    {
      type: "LANGUAGE",
      name_source: "영어",
      name_target: "English",
      description_source: "비즈니스 회화 가능",
      description_target: "Professional Working Proficiency",
    },
    {
      type: "LANGUAGE",
      name_source: "한국어",
      name_target: "Korean",
      description_source: "원어민",
      description_target: "Native",
    },
    {
      type: "CERTIFICATION",
      name_source: "AWS Certified Solutions Architect",
      name_target: "AWS Certified Solutions Architect",
      date: "2023.05",
    },
  ],
};

const globalUserMockData = {
  personalInfo: {
    name_source: "Jiwon Kim",
    name_target: "김지원",
    email: "jiwon.kim@example.com",
    phone: "010-1234-5678",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/jiwonkim" },
      { label: "Portfolio", url: "https://jiwonkim.dev" },
    ],
    summary_source:
      "Senior Software Engineer with 7 years of experience in full-stack development. Led design and development of scalable web applications, proficient in React, Node.js, and cloud infrastructure. Passionate about clean, maintainable code and solving complex business problems through technology.",
    summary_target:
      "7년차 시니어 소프트웨어 엔지니어로, 풀스택 개발 분야에서 풍부한 경험을 보유하고 있습니다. 확장 가능한 웹 애플리케이션의 설계 및 개발을 주도해 왔으며, React, Node.js 및 클라우드 인프라 활용에 능숙합니다. 깨끗하고 유지보수가 용이한 코드를 지향하며 기술을 통해 복잡한 비즈니스 문제를 해결하는 데 열정을 가지고 있습니다.",
  },
  experiences: [
    {
      id: "1",
      company_name_source: "Global Tech Solutions",
      company_name_target: "글로벌 테크 솔루션",
      role_source: "Senior Frontend Engineer",
      role_target: "시니어 프론트엔드 엔지니어",
      period: "2021.03 - 현재",
      bullets_source: [
        "Led the rebuilding of core e-commerce platform, improving loading speeds by 40% and user retention.",
        "Established automated CI/CD pipelines using GitHub Actions, reducing deployment time by 60%.",
        "Collaborated with UX designers to overhaul UI, achieving a 25% increase in conversion rates.",
        "Mentored junior developers and improved overall code quality through rigorous code reviews.",
      ],
      bullets_target: [
        "핵심 이커머스 플랫폼의 리빌딩을 주도하여 로딩 속도를 40% 개선하고 사용자 유지율을 향상시킴.",
        "GitHub Actions를 이용한 자동화된 CI/CD 파이프라인을 구축하여 배포 시간을 60% 단축함.",
        "UX 디자이너와 협업하여 사용자 인터페이스를 전면 개편, 전환율을 25% 상승시키는 성과를 거둠.",
        "주니어 개발자 멘토링 및 코드 리뷰를 통해 전반적인 코드 품질 향상에 기여함.",
      ],
    },
    {
      id: "2",
      company_name_source: "StartUp Innovations",
      company_name_target: "스타트업 이노베이션",
      role_source: "Full Stack Developer",
      role_target: "풀스택 개발자",
      period: "2018.06 - 2021.02",
      bullets_source: [
        "Developed and maintained various customer-facing web applications using React and Python/Django.",
        "Optimized DB queries and API endpoints, reducing average response time by 300ms.",
        "Integrated third-party payment gateways and authentication systems, strengthening platform security.",
      ],
      bullets_target: [
        "React와 Python/Django를 사용하여 다수의 고객 대응용 웹 애플리케이션을 개발 및 유지보수함.",
        "데이터베이스 쿼리 및 API 엔드포인트 최적화를 통해 평균 응답 시간을 300ms 단축함.",
        "제3자 결제 게이트웨이 및 인증 시스템을 통합하여 플랫폼 보안 및 수익 모델 강화에 기여함.",
      ],
    },
  ],
  educations: [
    {
      id: "1",
      school_name_source: "Korea University",
      school_name_target: "고려대학교",
      degree_source: "Bachelor of Science",
      degree_target: "학사",
      major_source: "Computer Science",
      major_target: "컴퓨터공학",
      start_date: "2014.03",
      end_date: "2018.02",
    },
  ],
  skills: [
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "Node.js" },
    { id: "4", name: "Next.js" },
    { id: "5", name: "AWS" },
    { id: "6", name: "Docker" },
  ],
  additionalItems: [
    {
      type: "LANGUAGE",
      name_source: "English",
      name_target: "영어",
      description_source: "Professional Working Proficiency",
      description_target: "비즈니스 회화 가능",
    },
    {
      type: "LANGUAGE",
      name_source: "Korean",
      name_target: "한국어",
      description_source: "Native",
      description_target: "원어민",
    },
    {
      type: "CERTIFICATION",
      name_source: "AWS Certified Solutions Architect",
      name_target: "AWS Certified Solutions Architect",
      date: "2023.05",
    },
  ],
};

import { isOutputKorean } from "@/lib/resume-language";

export function TemplatePreviewDialog({
  trigger,
  onSelectTemplate,
}: TemplatePreviewDialogProps) {
  const t = useTranslations("templatePreview");
  const tt = useTranslations("templatesPage");
  const locale = useLocale() as AppLocale;
  const [selectedTab, setSelectedTab] = useState("modern");
  const [isClient, setIsClient] = useState(false);

  // Pick the right mock data based on locale
  const mockResumeData = isOutputKorean(locale)
    ? globalUserMockData
    : koUserMockData;
  useEffect(() => {
    setIsClient(true);
    // Important: Register fonts early
    import("./pdf-templates/modern-pdf").then((mod) => {
      if (mod.registerFonts) mod.registerFonts();
    });
  }, []);

  const handleStart = () => {
    onSelectTemplate(selectedTab);
  };

  const getTemplateComponent = () => {
    const props = { ...mockResumeData, locale };
    switch (selectedTab) {
      case "classic":
        return <ClassicPdf {...props} />;
      case "minimal":
        return <MinimalPdf {...props} />;
      case "professional":
        return <ProfessionalPdf {...props} />;
      case "executive":
        return <ExecutivePdf {...props} />;
      case "modern":
      default:
        return <ModernPdf {...props} />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-background/95 backdrop-blur z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{t("title")}</DialogTitle>
                <DialogDescription className="mt-1">
                  {t("description")}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <X className="size-4" />
                  <span className="sr-only">{t("close")}</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="modern"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-3 sm:px-6 py-2 border-b bg-muted/30 shrink-0 overflow-hidden">
              <TabsList className="flex w-full sm:max-w-2xl sm:grid sm:grid-cols-5 p-1 h-auto gap-1">
                <TabsTrigger
                  value="modern"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  {tt("templateNames.modern")}
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  {tt("templateNames.professional")}
                </TabsTrigger>
                <TabsTrigger
                  value="executive"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  {tt("templateNames.executive")}
                </TabsTrigger>
                <TabsTrigger
                  value="classic"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  {tt("templateNames.classic")}
                </TabsTrigger>
                <TabsTrigger
                  value="minimal"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  {tt("templateNames.minimal")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-muted/10 relative overflow-hidden">
              {isClient && (
                <div className="absolute inset-0 w-full h-full py-2 px-1 sm:px-2 overflow-y-auto flex justify-center items-start">
                  {/* Remove Toolbar and optimize viewing experience */}
                  <style jsx global>{`
                    iframe {
                      border: none !important;
                      box-shadow:
                        0 4px 6px -1px rgb(0 0 0 / 0.1),
                        0 2px 4px -2px rgb(0 0 0 / 0.1);
                      border-radius: 8px;
                      background: white;
                    }
                    @media (min-width: 640px) {
                      iframe {
                        box-shadow:
                          0 20px 25px -5px rgb(0 0 0 / 0.1),
                          0 8px 10px -6px rgb(0 0 0 / 0.1);
                      }
                    }
                  `}</style>
                  <div
                    className="relative shadow-2xl mx-auto w-full bg-white rounded-lg overflow-hidden shrink-0"
                    style={{ aspectRatio: "1 / 1.4142" }}
                  >
                    <BlobProvider document={getTemplateComponent()}>
                      {({ url, loading }) => {
                        if (loading || !url) {
                          return (
                            <div className="flex items-center justify-center w-full h-full bg-white rounded-lg">
                              <div className="flex flex-col items-center gap-2">
                                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">
                                  Preparing Preview...
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <iframe
                            src={`${url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full rounded-lg"
                            style={{ border: "none" }}
                            title="Resume Preview"
                          />
                        );
                      }}
                    </BlobProvider>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-background shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto justify-center sm:justify-start">
                <Check className="size-4 text-primary" />
                <span>{t("selectedTemplate")}</span>
                <span className="font-semibold text-foreground capitalize">
                  {tt(`templateNames.${selectedTab}`)}
                </span>
              </div>
              <Button
                onClick={handleStart}
                className="gap-2 w-full sm:w-auto"
                size="lg"
              >
                {t("startWithTemplate")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
