"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { registerFonts } from "./pdf-templates/modern-pdf";
import { ModernPdf } from "./pdf-templates/modern-pdf";
import { ClassicPdf } from "./pdf-templates/classic-pdf";
import { MinimalPdf } from "./pdf-templates/minimal-pdf";
import { ProfessionalPdf } from "./pdf-templates/professional-pdf";
import { ExecutivePdf } from "./pdf-templates/executive-pdf";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-muted/20 text-muted-foreground animate-pulse">
        Generating Preview...
      </div>
    ),
  }
);

interface TemplatePreviewDialogProps {
  trigger?: React.ReactNode;
  onSelectTemplate: (template: string) => void;
}

const mockResumeData = {
  personalInfo: {
    name_en: "Jiwon Kim",
    email: "jiwon.kim@example.com",
    phone: "+82 10-1234-5678",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/jiwonkim" },
      { label: "Portfolio", url: "https://jiwonkim.dev" },
    ],
    summary:
      "Senior Software Engineer with 7+ years of experience in full-stack development. Proven track record of leading teams and delivering scalable web applications. Expertise in React, Node.js, and Cloud Infrastructure. Committed to writing clean, maintainable code and solving complex business problems through technology.",
  },
  experiences: [
    {
      id: "1",
      companyEn: "Global Tech Solutions",
      positionEn: "Senior Frontend Engineer",
      period: "2021.03 - Present",
      bulletsEn: [
        "Led a team of 5 developers to rebuild the core e-commerce platform, improving load time by 40% and increasing user retention.",
        "Implemented automated CI/CD pipelines using GitHub Actions, reducing deployment time by 60%.",
        "Collaborated with UX designers to revamp the user interface, resulting in a 25% increase in conversion rate.",
        "Mentored junior developers and conducted code reviews to ensure high code quality and adherence to best practices.",
      ],
    },
    {
      id: "2",
      companyEn: "StartUp Innovations",
      positionEn: "Full Stack Developer",
      period: "2018.06 - 2021.02",
      bulletsEn: [
        "Developed and maintained multiple client-facing web applications using React and Python/Django.",
        "Optimized database queries and API endpoints, reducing average response time by 300ms.",
        "Integrated third-party payment gateways and authentication systems, enhancing platform security and revenue collection.",
      ],
    },
  ],
  educations: [
    {
      id: "1",
      school_name_en: "Korea University",
      degree_en: "Bachelor of Science",
      major_en: "Computer Science",
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
      name_en: "English",
      description_en: "Professional Working Proficiency",
    },
    {
      type: "LANGUAGE",
      name_en: "Korean",
      description_en: "Native",
    },
    {
      type: "CERTIFICATION",
      name_en: "AWS Certified Solutions Architect",
      date: "2023.05",
    },
  ],
};

export function TemplatePreviewDialog({
  trigger,
  onSelectTemplate,
}: TemplatePreviewDialogProps) {
  const [selectedTab, setSelectedTab] = useState("modern");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    registerFonts();
  }, []);

  const handleStart = () => {
    onSelectTemplate(selectedTab);
  };

  const getTemplateComponent = () => {
    const props = mockResumeData;
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
                <DialogTitle className="text-xl">
                  이력서 템플릿 미리보기
                </DialogTitle>
                <DialogDescription className="mt-1">
                  실제 이력서가 아래처럼 자동 변환됩니다. 원하시는 스타일을
                  선택하세요.
                </DialogDescription>
              </div>
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
                  Modern
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  Pro
                </TabsTrigger>
                <TabsTrigger
                  value="executive"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  Exec
                </TabsTrigger>
                <TabsTrigger
                  value="classic"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  Classic
                </TabsTrigger>
                <TabsTrigger
                  value="minimal"
                  className="flex-1 text-[3.2vw] sm:text-sm px-0.5"
                >
                  Minimal
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-muted/10 relative overflow-hidden">
              {isClient && (
                <div className="absolute inset-0 w-full h-full flex justify-center py-4 sm:py-8 px-2 sm:px-0 overflow-y-auto">
                  {/* Remove Toolbar and optimize viewing experience */}
                  <style jsx global>{`
                    iframe {
                      border: none !important;
                      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
                        0 2px 4px -2px rgb(0 0 0 / 0.1);
                      border-radius: 8px;
                      background: white;
                    }
                    @media (min-width: 640px) {
                      iframe {
                        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
                          0 8px 10px -6px rgb(0 0 0 / 0.1);
                      }
                    }
                  `}</style>
                  <div className="w-full max-w-[800px] h-full relative">
                    <PDFViewer
                      width="100%"
                      height="100%"
                      showToolbar={false}
                      className="w-full h-full rounded-lg"
                      style={{ border: "none" }} // Ensure no inline border
                    >
                      {getTemplateComponent()}
                    </PDFViewer>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-background shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto justify-center sm:justify-start">
                <Check className="size-4 text-primary" />
                <span>선택된 템플릿: </span>
                <span className="font-semibold text-foreground capitalize">
                  {selectedTab}
                </span>
              </div>
              <Button
                onClick={handleStart}
                className="gap-2 w-full sm:w-auto"
                size="lg"
              >
                이 템플릿으로 시작하기
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
