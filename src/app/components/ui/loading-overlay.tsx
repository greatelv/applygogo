import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "처리 중...",
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
