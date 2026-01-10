import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Webhook Received]", body);

    const { type, data } = body;
    // PortOne V2 Webhook types: Transaction.Paid, Transaction.Failed, etc.
    if (type !== "Transaction.Paid") {
      return NextResponse.json({ received: true });
    }

    const { paymentId } = data;

    // 1. Get payment details from PortOne
    const payRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
      }
    );

    if (!payRes.ok)
      throw new Error("Failed to fetch payment details from PortOne");
    const payment = await payRes.json();

    // 2. Update Subscription in DB
    const customerId = payment.customer.id;
    const billingKey = payment.billingKey;

    const sub = await prisma.subscription.findUnique({
      where: { userId: customerId },
    });

    if (!sub) {
      console.error("Subscription not found for user:", customerId);
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 }
      );
    }

    const newStart = new Date();
    const newEnd = new Date(newStart);
    newEnd.setMonth(newEnd.getMonth() + 1);

    await prisma.subscription.update({
      where: { userId: customerId },
      data: {
        current_period_start: newStart,
        current_period_end: newEnd,
        status: "ACTIVE",
      },
    });

    // 3. Schedule NEXT payment
    const nextPaymentId = `sub_${customerId}_${newEnd.getTime()}`;
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
            billingKey: billingKey,
            orderName: "지원고고 정기 구독",
            customer: {
              id: customerId,
            },
            amount: {
              total: 29000,
            },
            currency: "KRW",
          },
          timeToPay: newEnd.toISOString(),
        }),
      }
    );

    console.log(
      "[Webhook Success] Subscription extended and next payment scheduled:",
      nextPaymentId
    );
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook Error]", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
