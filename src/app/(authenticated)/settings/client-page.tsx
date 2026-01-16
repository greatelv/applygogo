"use client";

import { useApp } from "@/app/context/app-context";
import { SettingsPage } from "@/app/components/settings-page";
import { deleteAccount } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Loader2, Sparkles, Lock } from "lucide-react";

interface SettingsClientPageProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  settings: any;
  portoneConfig: {
    storeId: string;
    channelKey: string;
  };
}

export function SettingsClientPage({
  user,
  settings,
  portoneConfig,
}: SettingsClientPageProps) {
  const router = useRouter();
  const { setPlan } = useApp();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // PayPal SPB Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    amount: number;
    passType: string;
  } | null>(null);

  const planType = settings?.planType || "FREE";
  const credits = settings?.credits || 0;
  const planExpiresAt = settings?.planExpiresAt
    ? new Date(settings.planExpiresAt)
    : null;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toLocaleDateString("en-US")
    : "No Info";

  // 디버깅: settings 데이터 확인
  console.log("Settings data:", settings);
  console.log("Created at:", settings?.created_at, "->", createdAt);

  const [paymentHistory, setPaymentHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/billing/history");
      if (res.ok) {
        const data = await res.json();
        setPaymentHistory(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  // 결제 내역 조회
  useEffect(() => {
    fetchHistory();
  }, []);

  // 업그레이드 (이용권 구매) 로직 -> PayPal SPB 모달 오픈
  const handleUpgrade = (
    passType: "PASS_7DAY" | "PASS_30DAY" | "REFILL_50"
  ) => {
    // 상품 정보 매핑
    const productConfig: Record<string, { amount: number; name: string }> = {
      PASS_7DAY: {
        amount: PLAN_PRODUCTS.PASS_7DAY.price,
        name: PLAN_PRODUCTS.PASS_7DAY.name,
      },
      PASS_30DAY: {
        amount: PLAN_PRODUCTS.PASS_30DAY.price,
        name: PLAN_PRODUCTS.PASS_30DAY.name,
      },
      REFILL_50: {
        amount: PLAN_PRODUCTS.CREDIT_50.price,
        name: PLAN_PRODUCTS.CREDIT_50.name,
      },
    };

    const product = productConfig[passType];
    setSelectedProduct({ ...product, passType });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (paymentId: string) => {
    setIsUpgrading(true);
    try {
      // 서버 검증
      const res = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!res.ok) throw new Error("Payment verification failed.");

      toast.success(`${selectedProduct?.name} purchase completed! Thank you.`);

      // 결제 내역 즉시 새로고침
      await fetchHistory();

      router.refresh();

      // 즉시 플랜 상태 업데이트
      if (
        selectedProduct?.passType &&
        selectedProduct.passType !== "REFILL_50"
      ) {
        setPlan(selectedProduct.passType);
      }
      setIsPaymentModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Purchase error: ${error.message}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  // 환불 요청 로직
  const handleRefund = async (paymentId: string) => {
    if (isRefunding) return;
    setIsRefunding(true);

    // 낙관적 업데이트: UI를 먼저 업데이트하여 반응성 향상
    const previousHistory = [...paymentHistory];
    const optimisticHistory = paymentHistory.map((item: any) =>
      item.id === paymentId ? { ...item, status: "REFUNDED" } : item
    );
    // @ts-ignore
    setPaymentHistory(optimisticHistory);

    try {
      // 1. 서버 요청
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Refund request failed.");
      }

      toast.success("Refund completed. Access revoked.");

      // 2. 실제 데이터 재검증 (백그라운드)
      await fetchHistory();

      router.refresh();
      setPlan("FREE");
    } catch (error: any) {
      console.error(error);
      toast.error(`Refund error: ${error.message}`);

      // 실패 시 롤백
      // @ts-ignore
      setPaymentHistory(previousHistory);
    } finally {
      setIsRefunding(false);
    }
  };

  // 이용권 활성화 여부 확인
  const now = new Date();
  const latestPayment: any = paymentHistory.find(
    (h: any) => h.status === "PAID" && h.name.includes("이용권")
  );

  let hasActivePass = planExpiresAt ? planExpiresAt > now : false;

  // 방금 결제한 경우 props(planExpiresAt)가 아직 반영 안 되었을 수 있으므로
  // 최근 결제 내역을 통해 활성 여부 보강 체크
  if (!hasActivePass && latestPayment) {
    const paidAt = new Date(latestPayment.paidAt);
    const durationDays = latestPayment.name.includes("30일") ? 30 : 7;
    const expiry = new Date(paidAt);
    expiry.setDate(expiry.getDate() + durationDays);
    if (expiry > now) {
      hasActivePass = true;
    }
  }

  let canRefund = false;
  if (latestPayment && hasActivePass) {
    const paidAt = new Date(latestPayment.paidAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 7일 이내 결제 건이고, 크레딧이 초기 상태와 유사한지 체크 (백엔드에서 최종 검증)
    const isWithin7Days = paidAt > sevenDaysAgo;
    canRefund = isWithin7Days;
  }

  const handleDeleteAccount = async () => {
    const promise = deleteAccount();

    toast.promise(promise, {
      loading: "Deleting account...",
      success: "Account deleted safely. Goodbye.",
      error: "Error deleting account.",
    });

    try {
      await promise;
      // Server action handles signOut redirect
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <SettingsPage
        userName={user.name || "User"}
        userEmail={user.email || ""}
        userImage={user.image || undefined}
        createdAt={createdAt}
        onDeleteAccount={handleDeleteAccount}
        hasActivePass={hasActivePass}
        passType={planType}
        quota={credits}
        onUpgrade={handleUpgrade}
        onRefund={handleRefund}
        onCancel={() => {}} // 기간제 이용권은 해지 기능 없음
        currentPeriodEnd={planExpiresAt || undefined}
        paymentHistory={paymentHistory}
        isUpgrading={isUpgrading}
        isRefunding={isRefunding}
        canRefund={canRefund}
      />

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden bg-white border-zinc-200 shadow-xl text-zinc-950 [&>button]:text-zinc-500 [&>button]:hover:text-zinc-900 [&>button]:hover:bg-zinc-100 [&>button]:transition-colors [&>button]:opacity-100">
          {selectedProduct && (
            <div className="text-zinc-950">
              <div className="bg-zinc-50/50 p-6 flex flex-col items-center border-b border-zinc-100">
                <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Sparkles className="size-5 text-blue-600" />
                </div>
                <DialogTitle className="text-lg font-bold text-center mb-1 text-zinc-900">
                  {selectedProduct.name}
                </DialogTitle>
                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="text-3xl font-bold tracking-tight text-zinc-900">
                    ${selectedProduct.amount.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-zinc-500">USD</span>
                </div>
                <DialogDescription className="text-center text-xs text-zinc-500">
                  One-time payment • Instant access
                </DialogDescription>
              </div>

              <div className="p-6 bg-white">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <div className="h-px bg-zinc-200 flex-1" />
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2">
                    Secure Checkout
                  </span>
                  <div className="h-px bg-zinc-200 flex-1" />
                </div>

                <div className="relative min-h-[160px]">
                  {isPaymentModalOpen && (
                    <PayPalPayment
                      storeId={portoneConfig.storeId}
                      channelKey={portoneConfig.channelKey}
                      orderName={selectedProduct.name}
                      amount={selectedProduct.amount}
                      user={user}
                      onSuccess={(paymentId) =>
                        handlePaymentComplete(paymentId)
                      }
                      onError={(msg) => toast.error(msg)}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                  <Lock className="size-3" />
                  <span>Encrypted & Secured by SSL</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PayPalPayment({
  storeId,
  channelKey,
  orderName,
  amount,
  user,
  onSuccess,
  onError,
}: {
  storeId: string;
  channelKey: string;
  orderName: string;
  amount: number;
  user: any;
  onSuccess: (paymentId: string) => void;
  onError: (msg: string) => void;
}) {
  useEffect(() => {
    async function load() {
      try {
        await PortOne.loadPaymentUI(
          {
            storeId,
            channelKey,
            paymentId: `payment-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            orderName,
            totalAmount: amount * 100, // USD cents
            currency: "USD",
            uiType: "PAYPAL_SPB", // Explicitly use PayPal SPB
            customer: {
              customerId: user.id,
              fullName: user.name || undefined,
              email: user.email || undefined,
            },
          },
          {
            onPaymentSuccess: (response: any) => {
              onSuccess(response.paymentId);
            },
            onPaymentFail: (error: any) => {
              onError(error.message || "Payment failed");
            },
          }
        );
      } catch (e) {
        console.error(e);
        onError("Failed to load payment UI");
      }
    }
    load();
  }, [storeId, channelKey, orderName, amount, user]); // Deps

  // PortOne renders into .portone-ui-container automatically
  return (
    <div className="w-full flex justify-center">
      <div
        className="portone-ui-container w-full"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
