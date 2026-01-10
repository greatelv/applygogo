import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { billingKey, channelKey } = await req.json();
    if (!billingKey || !channelKey) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { user } = session;

    // 1. Charge the first month immediately
    const paymentId = `first_${user.id}_${Date.now()}`;
    const payRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(
        paymentId
      )}/billing-key`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
        body: JSON.stringify({
          billingKey,
          orderName: "지원고고 PRO 구독 (첫 달)",
          customer: {
            id: user.id,
            fullName: user.name || undefined,
            email: user.email || undefined,
          },
          amount: {
            total: 9900,
          },
          currency: "KRW",
        }),
      }
    );

    const paymentResult = await payRes.json();

    if (!payRes.ok) {
      return NextResponse.json(
        { message: "첫 결제 승인에 실패했습니다.", detail: paymentResult },
        { status: 400 }
      );
    }

    // 카드 정보 추출 (포트원 응답 구조에 따라 유연하게 처리)
    const method = paymentResult.payment?.method;
    const card = method?.card;
    // 카드사 이름 (publisher.name 또는 name)
    const cardName = card?.publisher?.name || card?.name || "Credit Card";
    // 마스킹된 번호
    const cardNumber = card?.number || card?.mask_no || "****";

    // 2. Update Database (Subscription)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({ where: { code: "PRO" } });
      if (!plan) {
        await tx.plan.create({
          data: {
            code: "PRO",
            monthly_quota: 100,
            max_resumes: -1,
          },
        });
      }

      await tx.subscription.upsert({
        where: { userId: user.id },
        update: {
          planCode: "PRO",
          status: "ACTIVE",
          current_period_start: now,
          current_period_end: periodEnd,
          billing_key: billingKey,
          cancel_at_period_end: false,
          card_name: cardName,
          card_number: cardNumber,
        },
        create: {
          userId: user.id,
          planCode: "PRO",
          status: "ACTIVE",
          current_period_start: now,
          current_period_end: periodEnd,
          billing_key: billingKey,
          card_name: cardName,
          card_number: cardNumber,
        },
      });

      // 첫 결제 내역 기록
      await tx.paymentHistory.create({
        data: {
          userId: user.id,
          paymentId: paymentId,
          orderName: "지원고고 PRO 구독 (첫 달)",
          amount: 9900,
          currency: "KRW",
          status: "PAID",
          method: cardName,
          paidAt: now,
          receiptUrl: paymentResult.payment?.receiptUrl || null,
        },
      });
    });

    // 3. Schedule next payment
    try {
      const nextPaymentId = `sub_${user.id}_${periodEnd.getTime()}`;
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
              customer: { id: user.id },
              amount: { total: 9900 },
              currency: "KRW",
            },
            timeToPay: periodEnd.toISOString(),
          }),
        }
      );
    } catch (err) {
      console.error("[Schedule Error]", err);
    }

    return NextResponse.json({ message: "Subscription activated" });
  } catch (error) {
    console.error("[Billing Register Error]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
