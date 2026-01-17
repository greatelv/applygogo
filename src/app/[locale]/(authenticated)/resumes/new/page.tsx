"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { NewResumePage } from "@/app/components/new-resume-page";
import { uploadGlobalResumeAction } from "@/lib/global-actions";
import { Locale } from "@/lib/i18n-utils";

export default function GlobalNewResumePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Call global action with locale
      const result = await uploadGlobalResumeAction(formData, locale);

      if (result.success && result.resumeId) {
        // Move to detail page (where AI processing status will be shown)
        router.push(`/${locale}/resumes/${result.resumeId}`);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error: any) {
      alert(error.message || "Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-8">
      <NewResumePage
        onUpload={handleUpload}
        isUploading={isUploading}
        locale={locale as Locale}
      />
    </div>
  );
}
