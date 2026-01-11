"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

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

  // Dialog State
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Loading State
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // New loading states for button protection
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const serverPlan = settings?.subscription?.planCode || "FREE";
  const serverQuota = settings?.remainingQuota ?? 0;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toLocaleDateString()
    : "";

  const [paymentHistory, setPaymentHistory] = useState([]);

  // 결제 내역 조회
  useEffect(() => {
    async function fetchHistory() {
      if (serverPlan === "FREE" && !settings?.subscription) return; // PRO 유저 혹은 구독 이력 있는 유저만 조회

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
  }, [serverPlan, settings?.subscription]);

  // 초기 플랜 동기화
  useEffect(() => {
    if (serverPlan === "PRO") {
      setPlan("PRO");
    } else {
      setPlan("FREE");
    }
  }, [serverPlan, setPlan]);

  // 업그레이드 (구독 시작) 로직
  const handleUpgrade = async (newPlan: "PRO") => {
    if (isUpgrading) return;
    setIsUpgrading(true);

    try {
      // 1. 빌링키 발급 요청 (카드 등록)
      const issueRes = await PortOne.requestIssueBillingKey({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        billingKeyMethod: "EASY_PAY",
        issueName: "지원고고 PRO 정기 구독",
        customer: {
          customerId: user.id,
          fullName: user.name || undefined,
          email: user.email || undefined,
        },
      });

      if (issueRes.code != null) {
        // 취소 혹은 실패
        setIsUpgrading(false);
        return;
      }

      // 2. 서버에 구독 등록 요청 (빌링키 전달)
      const res = await fetch("/api/billing/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingKey: issueRes.billingKey,
          channelKey: portoneConfig.channelKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "구독 처리에 실패했습니다.");

      toast.success("PRO 플랜 구독이 시작되었습니다! 감사합니다.");
      router.refresh();

      // 즉시 플랜 상태 업데이트 (낙관적 업데이트)
      setPlan("PRO");
    } catch (error: any) {
      console.error(error);
      toast.error(`구독 오류: ${error.message}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  // 1. 해지 로직
  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const executeCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);

    try {
      const res = await fetch("/api/billing/subscription", {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "오류가 발생했습니다.");

      toast.success(
        "구독 해지가 예약되었습니다. 현재 기간까지 PRO 기능을 이용하실 수 있습니다."
      );
      router.refresh();
      setShowCancelDialog(false); // 다이얼로그 닫기
    } catch (error: any) {
      toast.error(`오류: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // 2. 해지 취소(구독 재개) 로직
  const handleResumeClick = () => {
    setShowResumeDialog(true);
  };

  const executeResume = async () => {
    if (isResuming) return;
    setIsResuming(true);

    try {
      const res = await fetch("/api/billing/subscription", {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "오류가 발생했습니다.");

      toast.success("해지 예약이 취소되었습니다.");
      router.refresh();
      setShowResumeDialog(false);
    } catch (error: any) {
      toast.error(`오류: ${error.message}`);
    } finally {
      setIsResuming(false);
    }
  };

  // 3. 결제 수단 변경 로직
  const handleUpdateCard = async () => {
    if (isUpdatingCard) return;
    setIsUpdatingCard(true);

    try {
      const issueRes = await PortOne.requestIssueBillingKey({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        billingKeyMethod: "EASY_PAY",
        issueName: "지원고고 결제 수단 변경",
        customer: {
          customerId: user.id,
          fullName: user.name || undefined,
          email: user.email || undefined,
        },
      });

      if (issueRes.code != null) {
        // 사용자가 취소했거나 에러 발생 시
        // console.log("Billing key issue cancelled/failed", issueRes);
        setIsUpdatingCard(false);
        return;
      }

      // 성공 시
      const res = await fetch("/api/billing/card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingKey: issueRes.billingKey,
          channelKey: portoneConfig.channelKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "카드 변경 실패");

      toast.success("결제 수단이 성공적으로 변경되었습니다.");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`오류: ${error.message}`);
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.info("계정 삭제가 요청되었습니다.");
  };

  return (
    <>
      <SettingsPage
        userName={user.name || "사용자"}
        userEmail={user.email || ""}
        userImage={user.image || undefined}
        createdAt={createdAt}
        onDeleteAccount={handleDeleteAccount}
        currentPlan={serverPlan}
        quota={serverQuota}
        onUpgrade={handleUpgrade}
        onCancel={handleCancelClick} // 클릭 시 다이얼로그 오픈
        onResume={handleResumeClick} // 클릭 시 다이얼로그 오픈
        onUpdateCard={handleUpdateCard}
        cancelAtPeriodEnd={settings?.subscription?.cancel_at_period_end}
        currentPeriodEnd={settings?.subscription?.current_period_end}
        paymentInfo={{
          cardName: settings?.subscription?.card_name,
          cardNumber: settings?.subscription?.card_number,
        }}
        paymentHistory={paymentHistory}
        // Loading Props
        isUpgrading={isUpgrading}
        isUpdatingCard={isUpdatingCard}
      />

      {/* 해지 확인 다이얼로그 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 구독을 해지하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              해지하더라도 현재 결제 주기가 끝날 때까지는 PRO 기능을 계속
              이용하실 수 있습니다. 다음 결제일부터 요금이 청구되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              계속 구독하기
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeCancel();
              }}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "해지 예약하기"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 해지 취소 확인 다이얼로그 */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>해지 예약을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              구독을 유지하여 끊김 없이 서비스를 이용하실 수 있습니다. 기존 결제
              수단으로 다음 결제일에 자동 결제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResuming}>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeResume();
              }}
              disabled={isResuming}
            >
              {isResuming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "구독 유지하기"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
