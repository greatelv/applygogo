"use client";

import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge"; // Badge 추가
import { Loader2, Zap, Calendar, CreditCard, Sparkles } from "lucide-react";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  portoneConfig: {
    storeId: string;
    channelKey: string;
  };
}

export function UpgradeModal({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  portoneConfig,
}: UpgradeModalProps) {
  const router = useRouter();
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(
    null
  );

  const handlePurchase = async (productType: "PASS_7DAY" | "PASS_30DAY") => {
    if (purchasingProduct) return;
    setPurchasingProduct(productType);

    try {
      const config = PLAN_PRODUCTS[productType];

      const response = await PortOne.requestPayment({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        paymentId: `payment-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        orderName: config.name,
        totalAmount: config.price,
        currency: "KRW",
        payMethod: "EASY_PAY",
        customer: {
          customerId: userId,
          fullName: userName || undefined,
          email: userEmail || undefined,
        },
      });

      if (response.code != null) {
        // 사용자가 취소했거나 에러 발생
        setPurchasingProduct(null);
        return;
      }

      // 서버 검증
      const verifyRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: response.paymentId }),
      });

      if (!verifyRes.ok) {
        throw new Error("결제 검증에 실패했습니다.");
      }

      toast.success(`${config.name} 구매가 완료되었습니다!`);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`오류: ${error.message}`);
    } finally {
      setPurchasingProduct(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0">
        <div className="px-6 py-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              이용권 구매하고 템플릿 잠금 해제
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              프리미엄 템플릿을 사용하려면 이용권이 필요합니다. <br />
              <span className="text-foreground font-medium">
                Split View 편집
              </span>
              과{" "}
              <span className="text-foreground font-medium">재번역 무제한</span>{" "}
              혜택도 함께 누리세요!
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 7일 이용권 (Basic) */}
            <div className="relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-foreground">
                  7일 이용권
                </h3>
                <p className="text-sm text-muted-foreground">
                  단기 집중 준비에 적합
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
                  </span>
                  <span className="text-lg font-medium">원</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}원
                  </span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    50% OFF
                  </Badge>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">
                    {PLAN_PRODUCTS.PASS_7DAY.credits}
                  </span>{" "}
                  크레딧
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  모든 고급 템플릿 사용
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  재번역 무제한
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {PLAN_PRODUCTS.PASS_7DAY.days}일간 이용
                </li>
              </ul>

              <Button
                onClick={() => handlePurchase("PASS_7DAY")}
                disabled={purchasingProduct === "PASS_7DAY"}
                className="w-full"
                variant="outline"
                size="lg"
              >
                {purchasingProduct === "PASS_7DAY" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "구매하기"
                )}
              </Button>
            </div>

            {/* 30일 이용권 (Premium) */}
            <div className="relative rounded-xl border border-primary bg-primary/5 p-6 shadow-md transition-all flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1">
                  추천
                </Badge>
              </div>

              <div className="mb-4 mt-2">
                <h3 className="font-semibold text-lg text-primary">
                  30일 이용권
                </h3>
                <p className="text-sm text-muted-foreground">
                  여유로운 이직 준비
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                  </span>
                  <span className="text-lg font-medium text-primary">원</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}원
                  </span>
                  <Badge variant="destructive" className="text-xs font-medium">
                    57% OFF
                  </Badge>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">
                    {PLAN_PRODUCTS.PASS_30DAY.credits}
                  </span>{" "}
                  크레딧
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  모든 고급 템플릿 사용
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  재번역 무제한
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {PLAN_PRODUCTS.PASS_30DAY.days}일간 이용
                </li>
              </ul>

              <Button
                onClick={() => handlePurchase("PASS_30DAY")}
                disabled={purchasingProduct === "PASS_30DAY"}
                className="w-full"
                size="lg"
              >
                {purchasingProduct === "PASS_30DAY" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "구매하기"
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground text-center break-keep">
              💡 이용권은 자동 갱신되지 않습니다. 기간이 만료되면 자동으로 무료
              플랜으로 전환되니 안심하고 구매하세요.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
