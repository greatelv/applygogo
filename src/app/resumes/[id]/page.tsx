"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Languages,
  FileText,
  Download,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ModernTemplate } from "@/lib/pdf-templates/modern-template";

interface WorkExperience {
  id: string;
  startDate: string;
  endDate: string;
  companyNameKr: string;
  roleKr: string;
  bulletsKr: string[];
  bulletsEn: string[];
}

interface ResumeDetail {
  id: string;
  title: string;
  originalFileUrl: string;
  status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
  currentStep: "UPLOAD" | "SUMMARY" | "TRANSLATE" | "DONE";
  workExperiences: WorkExperience[];
}

export default function ResumeEditorPage() {
  const { data: session } = useSession(); // Access session for header info
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchResume = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResume(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id, fetchResume]);

  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/resumes/${id}/summarize`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Summarize failed");
      await fetchResume();
    } catch (error) {
      alert("요약 실패");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/resumes/${id}/translate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Translation failed");
      await fetchResume();
    } catch (error) {
      alert("번역 실패");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock quota logic for layout (Replace with real data later)
  const quota = 2;

  // Prepare data for PDF
  const pdfData = resume
    ? {
        user: {
          name: session?.user?.name || "Candidate Name",
          email: session?.user?.email || "email@example.com",
        },
        experiences:
          resume.workExperiences?.map((exp) => ({
            company: exp.companyNameKr,
            role: exp.roleKr,
            startDate: exp.startDate,
            endDate: exp.endDate,
            bullets:
              exp.bulletsEn && exp.bulletsEn.length > 0
                ? exp.bulletsEn
                : exp.bulletsKr,
          })) || [],
      }
    : null;

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!resume) {
    return <div className="p-8 text-center">Resume not found</div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardLayout
        plan="FREE" // Mock
        quota={quota} // Mock
        userName={session?.user?.name || "User"}
        userEmail={session?.user?.email || ""}
        userImage={session?.user?.image || undefined}
        activeItem="resumes"
        onNavigate={() => router.push("/")}
        onLogout={() => {}}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {resume.title}
                  <Badge variant="outline">{resume.status}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Current Step: {resume.currentStep}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pdfData && (
                <PDFDownloadLink
                  document={<ModernTemplate data={pdfData} />}
                  fileName={`${resume.title.replace(".pdf", "")}_en.pdf`}
                >
                  {/* @ts-ignore */}
                  {({ loading }) => (
                    <Button disabled={loading}>
                      <Download className="size-4 mr-2" />
                      {loading ? "Generating PDF..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              <Button
                variant="outline"
                onClick={() => window.open(resume.originalFileUrl, "_blank")}
              >
                <FileText className="size-4 mr-2" />
                Original PDF
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {resume.workExperiences?.length || 0} work experiences extracted
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSummarize}
                  disabled={
                    isProcessing ||
                    resume.currentStep === "TRANSLATE" ||
                    resume.currentStep === "DONE"
                  }
                >
                  <Sparkles className="size-4 mr-2" />
                  1. Generate Summary
                </Button>
                <Button
                  onClick={handleTranslate}
                  disabled={
                    isProcessing ||
                    resume.currentStep === "UPLOAD" ||
                    resume.currentStep === "DONE" ||
                    !resume.workExperiences?.length
                  }
                  variant="outline"
                >
                  <Languages className="size-4 mr-2" />
                  2. Translate to English
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Split View Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Korean Source */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                🇰🇷 Korean Source (Summarized)
              </h3>
              {resume.workExperiences?.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {exp.companyNameKr} - {exp.roleKr}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {exp.startDate} ~ {exp.endDate}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {exp.bulletsKr.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
              {resume.workExperiences?.length === 0 && (
                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                  No summaries yet. Click &quot;Generate Summary&quot; to start.
                </div>
              )}
            </div>

            {/* Right: English Target */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                🇺🇸 English Target
              </h3>
              {resume.workExperiences?.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-blue-600">
                      {exp.companyNameKr} - {exp.roleKr}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {exp.startDate} ~ {exp.endDate}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {exp.bulletsEn ? (
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        {exp.bulletsEn.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Translation not available yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {resume.workExperiences?.length === 0 && (
                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                  Waiting for summary...
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
