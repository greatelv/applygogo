"use client";

import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
  const t = useTranslations("upgradeModal");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isGlobal = locale !== "ko";
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(
    null,
  );
  const isRestricted =
    !isGlobal &&
    userEmail !== "test@applygogo.com" &&
    process.env.NODE_ENV !== "development";

  const handlePurchase = async (productType: "PASS_7DAY" | "PASS_30DAY") => {
    // 한국 사용자(isGlobal === false)인 경우에만 심사 중 제한을 적용
    if (
      !isGlobal &&
      userEmail !== "test@applygogo.com" &&
      process.env.NODE_ENV !== "development"
    ) {
      toast.info("현재 결제 시스템 심사 중입니다. 정식 오픈 후 이용해 주세요.");
      return;
    }

    if (purchasingProduct) return;
    setPurchasingProduct(productType);

    try {
      const config = PLAN_PRODUCTS[productType];
      const price = isGlobal ? (config as any).priceGlobal : config.price;
      const currency = isGlobal ? "USD" : "KRW";

      let response: any;

      if (isGlobal) {
        // Small delay to ensure the container is ready
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Restore Promise wrapping for loadPaymentUI callbacks
        response = await new Promise((resolve, reject) => {
          PortOne.loadPaymentUI(
            {
              storeId: portoneConfig.storeId,
              channelKey:
                (portoneConfig as any).paypalChannelKey ||
                portoneConfig.channelKey,
              paymentId: `payment-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              orderName: config.name,
              totalAmount: price * 100, // USD requires cents
              currency: "USD",
              productType: "DIGITAL",
              uiType: "PAYPAL_SPB",
              customer: {
                customerId: userId,
                fullName: userName || undefined,
                email: userEmail || undefined,
              },
            },
            {
              onPaymentSuccess: (res) => resolve(res),
              onPaymentFail: (err) =>
                reject(new Error(err.message || "Payment failed")),
            },
          );
        });
      } else {
        // Standard payment for KR users
        response = await PortOne.requestPayment({
          storeId: portoneConfig.storeId,
          channelKey: portoneConfig.channelKey,
          paymentId: `payment-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          orderName: config.name,
          totalAmount: price,
          currency: currency,
          payMethod: "EASY_PAY",
          customer: {
            customerId: userId,
            fullName: userName || undefined,
            email: userEmail || undefined,
          },
        });
      }

      if (response?.code != null) {
        // User cancelled or error occurred (for requestPayment mainly)
        setPurchasingProduct(null);
        return;
      }

      // Server verification
      const verifyRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: response.paymentId }),
      });

      if (!verifyRes.ok) {
        throw new Error(t("verifyError"));
      }

      toast.success(t("success", { name: config.name }));
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(t("error", { message: error.message }));
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
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {t.rich("description", {
                br: () => <br />,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 7일 이용권 (Basic) */}
            <div className="relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-foreground">
                  {t("plans.pass7.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("plans.pass7.subtitle")}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-medium">{t("currency")}</span>
                  <span className="text-3xl font-bold">
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_7DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {t("currency")}
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_7DAY.originalPriceGlobal
                      : PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    50% {t("off")}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">
                    {t("plans.pass7.features.0", {
                      credits: PLAN_PRODUCTS.PASS_7DAY.credits,
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass7.features.1")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass7.features.2")}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass7.features.3", {
                    days: PLAN_PRODUCTS.PASS_7DAY.days,
                  })}
                </li>
              </ul>

              <Button
                onClick={() => handlePurchase("PASS_7DAY")}
                disabled={purchasingProduct === "PASS_7DAY" || isRestricted}
                className="w-full"
                variant="outline"
                size="lg"
              >
                {purchasingProduct === "PASS_7DAY" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRestricted ? (
                  t("beta")
                ) : (
                  t("cta")
                )}
              </Button>
            </div>

            {/* 30일 이용권 (Premium) */}
            <div className="relative rounded-xl border border-primary bg-primary/5 p-6 shadow-md transition-all flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1">
                  {t("plans.pass30.badge")}
                </Badge>
              </div>

              <div className="mb-4 mt-2">
                <h3 className="font-semibold text-lg text-primary">
                  {t("plans.pass30.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("plans.pass30.subtitle")}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-medium text-primary">
                    {t("currency")}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_30DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {t("currency")}
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_30DAY.originalPriceGlobal
                      : PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-xs font-medium">
                    57% {t("off")}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">
                    {t("plans.pass30.features.0", {
                      credits: PLAN_PRODUCTS.PASS_30DAY.credits,
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass30.features.1")}
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass30.features.2")}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {t("plans.pass30.features.3", {
                    days: PLAN_PRODUCTS.PASS_30DAY.days,
                  })}
                </li>
              </ul>

              <Button
                onClick={() => handlePurchase("PASS_30DAY")}
                disabled={purchasingProduct === "PASS_30DAY" || isRestricted}
                className="w-full"
                size="lg"
              >
                {purchasingProduct === "PASS_30DAY" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRestricted ? (
                  t("beta")
                ) : (
                  t("cta")
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground text-center break-keep">
              {t("notice")}
            </p>
          </div>
        </div>

        {/* PayPal SPB Container Overlay (for Modal) */}
        {purchasingProduct && isGlobal && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-extrabold text-gray-900">
                  {tc("labels.paypalPayment") || "PayPal Payment"}
                </h3>
                <p className="text-sm text-gray-500">
                  {tc("notices.paypalInstructions") ||
                    "Please select your preferred payment method below."}
                </p>
              </div>
              <div
                className="portone-ui-container w-full bg-white transition-all overflow-hidden"
                data-portone-ui-type="paypal-spb"
              >
                <div className="flex flex-col items-center justify-center min-h-[160px] gap-2 p-4">
                  <Loader2 className="size-6 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Loading PayPal...
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  window.location.reload();
                }}
              >
                {tc("cancel")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
