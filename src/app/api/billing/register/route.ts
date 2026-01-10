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
          orderName: "지원고고 정기 구독 (첫 달)",
          customer: {
            id: user.id,
            fullName: user.name || undefined,
            email: user.email || undefined,
          },
          amount: {
            total: 29000,
          },
          currency: "KRW",
        }),
      }
    );

    if (!payRes.ok) {
      const error = await payRes.json();
      return NextResponse.json(
        { message: "첫 결제 승인에 실패했습니다.", detail: error },
        { status: 400 }
      );
    }

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
              orderName: "지원고고 정기 구독",
              customer: { id: user.id },
              amount: { total: 29000 },
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
