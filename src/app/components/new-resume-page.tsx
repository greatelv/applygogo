import { useState } from "react";
import { Upload, FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";
import { useApp } from "../context/app-context";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface NewResumePageProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

const workflowSteps = [
  { id: "upload", label: "Upload PDF", description: "Select Resume" },
  { id: "processing", label: "AI Process", description: "Summary & Translate" },
  { id: "edit", label: "Edit", description: "Modify Content" },
  { id: "preview", label: "Preview", description: "Choose Template" },
];

export function NewResumePage({ onUpload, isUploading }: NewResumePageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Only PDF files can be uploaded. Please try again."
  );

  const router = useRouter();
  const { quota, plan } = useApp();
  const hasSufficientCredits = quota >= 1;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || !hasSufficientCredits) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading || !hasSufficientCredits) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File exceeds 5MB. Please upload a smaller file.");
        setShowErrorDialog(true);
        return;
      }
      onUpload(file);
      setSelectedFile(file);
    } else {
      setErrorMessage("Only PDF files can be uploaded. Please try again.");
      setShowErrorDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSufficientCredits) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File exceeds 5MB. Please upload a smaller file.");
        setShowErrorDialog(true);
        e.target.value = ""; // Reset input
        return;
      }
      onUpload(file);
      setSelectedFile(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Upload</h1>
        <p className="text-sm text-muted-foreground">
          AI automatically summarizes and translates your PDF resume
        </p>
      </div>

      {!hasSufficientCredits ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-12">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
                <Sparkles className="size-8 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Insufficient Credits
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  You don't have enough credits for AI analysis. Please recharge
                  or upgrade your plan.
                </p>
              </div>
            </div>

            <div className="max-w-xs mx-auto">
              {plan === "FREE" ? (
                <Button
                  onClick={() => router.push("/settings#payment-section")}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md border-0"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    Buy Pass for Unlimited Access
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/settings#payment-section")}
                  className="w-full h-11"
                >
                  Recharge Credits
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors relative cursor-pointer",
            isDragging
              ? "border-foreground/40 bg-accent"
              : "border-border hover:border-foreground/30",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="size-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Uploading...</h3>
              <p className="text-sm text-muted-foreground">
                Securely saving your file.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="size-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Drag & Drop PDF to Upload
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Or click the button below to select a file
              </p>
              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">
                    <FileText className="size-4 mr-2" />
                    Select File
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-muted/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Tips
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ArrowRight className="size-4 mt-0.5 shrink-0 text-primary" />
            <span>Resumes with clearly separated sections work best</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="size-4 mt-0.5 shrink-0 text-primary" />
            <span>We recommend PDF files under 5MB</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="size-4 mt-0.5 shrink-0 text-primary" />
            <span>
              Get your final PDF through summary and translation steps after
              uploading
            </span>
          </li>
        </ul>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid File Format</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
