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
          orderName: "지원고고 Pro 플랜 (매월 자동 결제)",
          customer: {
            id: session.user.id, // Good practice to track customer
          },
          amount: {
            total: 9900,
            currency: "KRW",
          },
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

    if (paymentData.status !== "PAID") {
      return NextResponse.json(
        { message: "결제 상태가 PAID가 아닙니다." },
        { status: 400 }
      );
    }

    // 2. Update Database (Subscription)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Billing register error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
