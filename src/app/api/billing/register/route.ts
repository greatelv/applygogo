import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { billingKey, channelKey } = await req.json();

    if (!billingKey) {
      return NextResponse.json(
        { message: "Missing billingKey" },
        { status: 400 }
      );
    }

    // 0. Get user from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const secret = process.env.PORTONE_API_SECRET;

    // 1. (Optional) In V2, billing key is already issued. We can verify it or just use it.
    // For subscription, we immediately charge the first month.

    const paymentId = `sub-${crypto.randomUUID()}`;

    // Request Payment using Billing Key
    const payRes = await fetch(
      `https://api.portone.io/payments/${paymentId}/billing-key`,
      {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingKey,
          channelKey,
          orderName: "지원고고 Pro 플랜 (매월 자동 결제)",
          customer: {
            id: user.id, // Consistent with client-side user.id
          },
          amount: {
            total: 9900,
          },
          currency: "KRW",
        }),
      }
    );

    if (!payRes.ok) {
      const errorText = await payRes.text();
      console.error("Billing key payment failed:", errorText);
      return NextResponse.json(
        { message: "첫 달 결제 실패", detail: errorText },
        { status: 400 }
      );
    }

    const paymentData = await payRes.json();
    console.log(
      "[Billing Register] PortOne Payment Data:",
      JSON.stringify(paymentData, null, 2)
    );

    const status = paymentData.status || paymentData.payment?.status;
    const isPaid = status === "PAID" || !!paymentData.payment?.paidAt;

    console.log("[Billing Register] Status Check:", { status, isPaid });

    if (!isPaid) {
      console.error(
        "[Billing Register] Payment status failure. Full data:",
        paymentData
      );
      return NextResponse.json(
        {
          message: "결제 상태가 PAID가 아닙니다.",
          status: status || "UNKNOWN",
          detail: paymentData,
        },
        { status: 400 }
      );
    }

    // 2. Update Database (Subscription)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
      // Ensure Plan exists
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
        },
        create: {
          userId: user.id,
          planCode: "PRO",
          status: "ACTIVE",
          current_period_start: now,
          current_period_end: periodEnd,
          billing_key: billingKey,
        },
      });
    });

    // 3. Schedule next payment via PortOne V2 API
    try {
      const nextPaymentId = `sub_${user.id}_${periodEnd.getTime()}`;
      const scheduleRes = await fetch(
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
              billingKey: billingKey,
              orderName: "지원고고 정기 구독",
              customer: {
                id: user.id,
                fullName: user.name || undefined,
                email: user.email || undefined,
              },
              amount: {
                total: 29000, // 실제 상품 가격으로 설정 필요
              },
              currency: "KRW",
            },
            timeToPay: periodEnd.toISOString(),
          }),
        }
      );

      if (!scheduleRes.ok) {
        const error = await scheduleRes.json();
        console.error("[Schedule Error]", error);
      } else {
        console.log(
          "[Schedule Success] Next payment scheduled:",
          nextPaymentId
        );
      }
    } catch (err) {
      console.error("[Schedule Exception]", err);
    }

    return NextResponse.json({
      message: "Subscription registered and next payment scheduled",
    });
  } catch (error) {
    console.error("[Billing Register Error]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
