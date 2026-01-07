"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF, type ResumePDFData } from "./resume-pdf";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";

export default function DownloadResumeButton({
  data,
  fileName,
}: {
  data: ResumePDFData;
  fileName: string;
}) {
  return (
    <PDFDownloadLink
      document={<ResumePDF data={data} />}
      fileName={fileName}
      style={{ textDecoration: "none" }}
    >
      {({ blob, url, loading, error }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? "생성 중..." : "PDF 다운로드"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
