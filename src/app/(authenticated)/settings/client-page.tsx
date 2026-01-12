"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";

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

  // 결제 내역 조회
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/billing/history");
        if (res.ok) {
          const data = await res.json();
          setPaymentHistory(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
      }
    }
    fetchHistory();
  }, []);

  // 이용권 활성화 여부 확인
  const now = new Date();
  const hasActivePass = planExpiresAt ? planExpiresAt > now : false;

  // 초기 플랜 동기화 (레거시 호환성)
  useEffect(() => {
    if (hasActivePass) {
      setPlan("PRO");
    } else {
      setPlan("FREE");
    }
  }, [hasActivePass, setPlan]);

  // 업그레이드 (이용권 구매) 로직
  const handleUpgrade = async (
    passType: "PASS_7DAY" | "PASS_30DAY" | "REFILL_50" | "PRO"
  ) => {
    if (isUpgrading) return;
    setIsUpgrading(true);

    try {
      // 상품 정보 매핑
      const productConfig: Record<string, { amount: number; name: string }> = {
        PASS_7DAY: { amount: 9900, name: "ApplyGoGo 7일 이용권" },
        PASS_30DAY: { amount: 12900, name: "ApplyGoGo 30일 이용권" },
        REFILL_50: { amount: 3900, name: "크레딧 충전 50" },
        PRO: { amount: 12900, name: "ApplyGoGo 30일 이용권" }, // 기본값
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
        payMethod: "CARD",
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
      router.refresh();

      // 즉시 플랜 상태 업데이트
      if (passType !== "REFILL_50") {
        setPlan("PRO");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`구매 오류: ${error.message}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.info("계정 삭제가 요청되었습니다.");
  };

  return (
    <SettingsPage
      userName={user.name || "사용자"}
      userEmail={user.email || ""}
      userImage={user.image || undefined}
      createdAt={createdAt}
      onDeleteAccount={handleDeleteAccount}
      hasActivePass={hasActivePass}
      quota={credits}
      onUpgrade={handleUpgrade}
      onCancel={() => {}} // 기간제 이용권은 해지 기능 없음
      currentPeriodEnd={planExpiresAt || undefined}
      paymentHistory={paymentHistory}
      isUpgrading={isUpgrading}
    />
  );
}
