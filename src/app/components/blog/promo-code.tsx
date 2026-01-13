"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";

export function PromoCode() {
  const [copied, setCopied] = useState(false);
  const code = "KEWFK";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("프로모션 코드가 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground mb-1.5 font-medium ml-1">
        추가 5% 할인 코드
      </p>
      <div className="flex items-center gap-2 h-10">
        <div className="flex-1 bg-muted/50 border border-border px-3 rounded-md text-sm font-mono font-bold text-center tracking-wider h-full flex items-center justify-center">
          {code}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-full w-10 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">Copy promo code</span>
        </Button>
      </div>
    </div>
  );
}
