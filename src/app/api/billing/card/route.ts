import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { billingKey, channelKey } = await req.json();

    if (!billingKey) {
      return NextResponse.json(
        { message: "Missing billing key" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { message: "구독 정보가 없습니다." },
        { status: 404 }
      );
    }

    // 1. 기존 예약된 스케줄 취소 (V2)
    // 현재 만료일 기준 ID 예측
    const currentEnd = new Date(user.subscription.current_period_end);
    const oldPaymentId = `sub_${userId}_${currentEnd.getTime()}`;

    try {
      await fetch(`https://api.portone.io/payment-schedules`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
        body: JSON.stringify({
          scheduleIds: [oldPaymentId],
        }),
      });
      console.log("Old schedule canceled:", oldPaymentId);
    } catch (e) {
      console.error("Failed to cancel old schedule:", e);
      // 계속 진행 (새 예약 덮어쓰거나 안되면 Webhook 방어)
    }

    // 1-1. 기존 빌링키 삭제
    const oldBillingKey = user.subscription.billing_key;
    if (oldBillingKey && oldBillingKey !== billingKey) {
      try {
        await fetch(
          `https://api.portone.io/billing-keys/${encodeURIComponent(
            oldBillingKey
          )}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
            },
          }
        );
        console.log("Old billing key deleted:", oldBillingKey);
      } catch (e) {
        console.error("Failed to delete old billing key:", e);
      }
    }

    // 2. 카드 정보 조회 (포트원 빌링키 상세 조회 V2)
    // 새 카드의 이름/번호를 DB에 저장하기 위함
    let cardName = "Credit Card";
    let cardNumber = "****";

    try {
      const billingKeyRes = await fetch(
        `https://api.portone.io/billing-keys/${encodeURIComponent(billingKey)}`,
        {
          headers: {
            Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          },
        }
      );
      if (billingKeyRes.ok) {
        const billingData = await billingKeyRes.json();
        const method = billingData.billingKey.methods?.find(
          (m: any) => m.type === "CARD"
        );
        if (method?.card) {
          cardName =
            method.card.publisher?.name || method.card.name || cardName;
          cardNumber = method.card.number || method.card.mask_no || cardNumber;
        }
      }
    } catch (e) {
      console.error("Failed to fetch billing key details:", e);
    }

    // 3. DB 업데이트 (새 빌링키)
    await prisma.subscription.update({
      where: { userId },
      data: {
        billing_key: billingKey,
        card_name: cardName,
        card_number: cardNumber,
        // 해지 예약 상태였다면, 카드 바꿨으니 구독 유지(해지 취소)로 볼 것인가?
        // 보통은 결제수단 변경은 '유지' 의도가 강하므로 해지 예약도 풉니다.
        cancel_at_period_end: false,
      },
    });

    // 4. 새 빌링키로 스케줄 재예약 (V2)
    const nextPaymentId = `sub_${userId}_${currentEnd.getTime()}`; // ID 재사용 가능하면 재사용, 아니면 새로? -> 취소했으니 재사용 가능할듯

    await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(
        nextPaymentId
      )}/schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
        body: JSON.stringify({
          payment: {
            billingKey,
            orderName: "지원고고 PRO 정기 구독",
            customer: {
              id: userId,
              fullName: user.name || undefined,
              email: user.email || undefined,
            },
            amount: { total: 12900 },
            currency: "KRW",
          },
          timeToPay: currentEnd.toISOString(),
        }),
      }
    );

    return NextResponse.json({
      success: true,
      message: "결제 수단이 변경되었습니다.",
    });
  } catch (error) {
    console.error("Update card error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
