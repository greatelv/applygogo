"use client";

import { useApp } from "@/app/context/app-context";
import { SettingsPage } from "@/app/components/settings-page";
import { deleteAccount } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

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

  const planType = settings?.planType || "FREE";
  const credits = settings?.credits || 0;
  const planExpiresAt = settings?.planExpiresAt
    ? new Date(settings.planExpiresAt)
    : null;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toLocaleDateString("ko-KR")
    : "정보 없음";

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

  // 업그레이드 (이용권 구매) 로직
  const handleUpgrade = async (
    passType: "PASS_7DAY" | "PASS_30DAY" | "REFILL_50"
  ) => {
    if (isUpgrading) return;
    setIsUpgrading(true);

    try {
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

      const response = await PortOne.requestPayment({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        paymentId: `payment-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        orderName: product.name,
        totalAmount: product.amount,
        currency: "KRW",
        payMethod: "EASY_PAY",
        customer: {
          customerId: user.id,
          fullName: user.name || undefined,
          email: user.email || undefined,
        },
      });

      if (response.code != null) {
        // 사용자가 취소했거나 에러 발생
        setIsUpgrading(false);
        return;
      }

      // 서버 검증
      const res = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: response.paymentId }),
      });

      if (!res.ok) throw new Error("결제 검증에 실패했습니다.");

      toast.success(`${product.name} 구매가 완료되었습니다! 감사합니다.`);

      // 결제 내역 즉시 새로고침
      await fetchHistory();

      router.refresh();

      // 즉시 플랜 상태 업데이트
      if (passType !== "REFILL_50") {
        setPlan(passType);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`구매 오류: ${error.message}`);
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
        throw new Error(data.message || "환불 요청에 실패했습니다.");
      }

      toast.success("환불이 완료되었습니다. 이용권 권한이 회수되었습니다.");

      // 2. 실제 데이터 재검증 (백그라운드)
      await fetchHistory();

      router.refresh();
      setPlan("FREE");
    } catch (error: any) {
      console.error(error);
      toast.error(`환불 오류: ${error.message}`);

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
      loading: "계정을 삭제하고 있습니다...",
      success: "계정이 안전하게 삭제되었습니다. 안녕히 가세요.",
      error: "계정 삭제 중 오류가 발생했습니다.",
    });

    try {
      await promise;
      // Server action handles signOut redirect
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsPage
      userName={user.name || "사용자"}
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
  );
}
