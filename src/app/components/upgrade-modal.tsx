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
import { Loader2, Zap, Calendar, CreditCard } from "lucide-react";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

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
        totalAmount: config.amount,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            이용권 구매하고 템플릿 잠금 해제
          </DialogTitle>
          <DialogDescription>
            프리미엄 템플릿을 사용하려면 이용권이 필요합니다. 재번역도
            무제한으로 이용하세요!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* 7일 이용권 */}
          <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              7일 이용권
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
              <span className="text-lg text-slate-600">원</span>
              <span className="ml-2 text-sm text-slate-400/80 line-through font-normal">
                {PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}
              </span>
              <span className="ml-2 text-xs text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                -50%
              </span>
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                {PLAN_PRODUCTS.PASS_7DAY.credits} 크레딧 포함
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                모든 템플릿 사용
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                {PLAN_PRODUCTS.PASS_7DAY.days}일간 이용
              </li>
            </ul>
            <Button
              onClick={() => handlePurchase("PASS_7DAY")}
              disabled={purchasingProduct === "PASS_7DAY"}
              className="w-full"
              variant="outline"
            >
              {purchasingProduct === "PASS_7DAY" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "구매하기"
              )}
            </Button>
          </div>

          {/* 30일 이용권 (추천) */}
          <div className="border-2 border-purple-500 rounded-xl p-6 relative bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              추천
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              30일 이용권
            </h3>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
              <span className="text-lg text-slate-600">원</span>
              <span className="ml-2 text-sm text-slate-400/80 line-through font-normal">
                {PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}
              </span>
              <span className="ml-2 text-xs text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                -57%
              </span>
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                {PLAN_PRODUCTS.PASS_30DAY.credits} 크레딧 포함
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                모든 템플릿 사용
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                {PLAN_PRODUCTS.PASS_30DAY.days}일간 이용
              </li>
            </ul>
            <Button
              onClick={() => handlePurchase("PASS_30DAY")}
              disabled={purchasingProduct === "PASS_30DAY"}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {purchasingProduct === "PASS_30DAY" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "구매하기"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>안내:</strong> 이용권은 자동 갱신되지 않습니다. 기간이
            만료되면 자동으로 무료 플랜으로 전환됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
