"use client";

import { PricingCard } from "@/components/pricing-card";
import { PortOneScript } from "@/components/portone-script";
import { verifyPayment } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleUpgrade = () => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    // @ts-ignore
    if (!window.IMP) {
      toast.error("결제 모듈이 로드되지 않았습니다. 새로고침 해주세요.");
      return;
    }

    const { IMP } = window as any;

    // Unique ID generation
    const merchant_uid = `mid_${new Date().getTime()}_${session.user.id.slice(
      -4
    )}`;

    IMP.request_pay(
      {
        pg: "html5_inicis", // PG Provider (can be testing)
        pay_method: "card",
        merchant_uid: merchant_uid,
        name: "ApplyGogo PRO Subscription",
        amount: 9900, // 9,900 KRW
        buyer_email: session.user.email,
        buyer_name: session.user.name,
        buyer_tel: "010-0000-0000", // Optional or from user profile
      },
      async (rsp: any) => {
        if (rsp.success) {
          try {
            // Verify and Subscribe on Server
            await verifyPayment(rsp.imp_uid, rsp.merchant_uid, "PRO");
            toast.success("구독이 완료되었습니다! (PRO Plan Activated)");
            router.push("/dashboard");
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error("결제 검증에 실패했습니다. 관리자에게 문의하세요.");
          }
        } else {
          toast.error(`결제 실패: ${rsp.error_msg}`);
        }
      }
    );
  };

  return (
    <>
      <PortOneScript />
      <div className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            단순하고 투명한 요금제
          </h1>
          <p className="text-muted-foreground text-lg">
            글로벌 커리어의 시작, ApplyGogo와 함께하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="FREE"
            price="0원"
            description="가볍게 시작하는 분들을 위한 플랜"
            features={[
              "최신 이력서 1개 보관",
              "AI 분석 및 번역 (월 3회)",
              "기본 템플릿 제공",
              "PDF 다운로드",
            ]}
            buttonText="현재 이용 중"
            onButtonClick={() => {}} // No action for free
            isLoading={false}
          />
          <PricingCard
            title="PRO"
            price="9,900원"
            description="본격적인 구직 활동을 위한 최적의 선택"
            features={[
              "무제한 이력서 보관",
              "AI 분석 및 번역 (월 100회)",
              "모든 프리미엄 템플릿",
              "우선 기술 지원",
            ]}
            isPopular
            buttonText="PRO 업그레이드"
            onButtonClick={handleUpgrade}
          />
        </div>
      </div>
    </>
  );
}
