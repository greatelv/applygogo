"use client";

import { useState } from "react";
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
import {
  Loader2,
  Zap,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { PayPalPayment } from "@/app/components/payment/paypal-payment";

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
  const [purchasingProduct, setPurchasingProduct] = useState<
    "PASS_7DAY" | "PASS_30DAY" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const product = purchasingProduct ? PLAN_PRODUCTS[purchasingProduct] : null;

  const handlePaymentComplete = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      // 서버 검증
      const verifyRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!verifyRes.ok) {
        throw new Error("Payment verification failed.");
      }

      toast.success(`${product?.name} purchase completed!`);
      // 모든 상태 초기화 및 모달 닫기
      setPurchasingProduct(null);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setPurchasingProduct(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0">
        <div className="px-6 py-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Unlock Premium Templates
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Get a pass to use premium templates. <br />
              <span className="text-foreground font-medium">
                Split View Edit
              </span>
              {" and "}
              <span className="text-foreground font-medium">
                Unlimited Re-translation
              </span>{" "}
              included!
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-muted/10 min-h-[400px]">
          {purchasingProduct && product ? (
            // Payment View
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 -ml-2"
                  onClick={() => setPurchasingProduct(null)}
                  disabled={isProcessing}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm font-medium text-muted-foreground">
                  Checkout
                </span>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm max-w-md mx-auto w-full text-neutral-900">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-neutral-500">
                      USD
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-center gap-2">
                  <div className="h-px bg-neutral-100 flex-1" />
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2">
                    Secure Checkout
                  </span>
                  <div className="h-px bg-neutral-100 flex-1" />
                </div>

                <div className="relative min-h-[200px] flex items-center justify-center">
                  <PayPalPayment
                    storeId={portoneConfig.storeId}
                    channelKey={portoneConfig.channelKey}
                    orderName={product.name}
                    amount={product.price}
                    user={{
                      id: userId,
                      name: userName,
                      email: userEmail,
                    }}
                    onSuccess={handlePaymentComplete}
                    onError={(msg) => toast.error(msg)}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <Loader2 className="size-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                  <Lock className="size-3" />
                  <span>Encrypted & Secured by SSL</span>
                </div>
              </div>
            </div>
          ) : (
            // Selection View (Original)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7-Day Pass (Basic) */}
              <div className="relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-foreground">
                    7-Day Pass
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For short-term preparation
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${PLAN_PRODUCTS.PASS_7DAY.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground line-through">
                      ${PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      55% OFF
                    </Badge>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground">
                      {PLAN_PRODUCTS.PASS_7DAY.credits}
                    </span>{" "}
                    Credits
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary shrink-0" />
                    All Premium Templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    Unlimited Re-translation
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {PLAN_PRODUCTS.PASS_7DAY.days} Days Access
                  </li>
                </ul>

                <Button
                  onClick={() => setPurchasingProduct("PASS_7DAY")}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  Purchase
                </Button>
              </div>

              {/* 30-Day Pass (Premium) */}
              <div className="relative rounded-xl border border-primary bg-primary/5 p-6 shadow-md transition-all flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1">
                    Recommended
                  </Badge>
                </div>

                <div className="mb-4 mt-2">
                  <h3 className="font-semibold text-lg text-primary">
                    30-Day Pass
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stress-free preparation
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      ${PLAN_PRODUCTS.PASS_30DAY.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground line-through">
                      ${PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toFixed(2)}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-xs font-medium"
                    >
                      60% OFF
                    </Badge>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground font-medium">
                      {PLAN_PRODUCTS.PASS_30DAY.credits}
                    </span>{" "}
                    Credits
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary shrink-0" />
                    All Premium Templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    Unlimited Re-translation
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {PLAN_PRODUCTS.PASS_30DAY.days} Days Access
                  </li>
                </ul>

                <Button
                  onClick={() => setPurchasingProduct("PASS_30DAY")}
                  className="w-full"
                  size="lg"
                >
                  Purchase
                </Button>
              </div>
            </div>
          )}

          {!purchasingProduct && (
            <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground text-center break-keep">
                💡 Passes do not renew automatically. You will revert to the
                Free plan after the pass expires.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
