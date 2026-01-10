import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // 결제 성공 이벤트가 아니면 무시
    if (type !== "Transaction.Paid") {
      return NextResponse.json({ received: true });
    }

    const { paymentId } = data;

    // 1. 포트원으로부터 상세 결제 정보 조회
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

    const customerId = payment.customer.id;
    const billingKey = payment.billingKey;

    // 2. DB 구독 정보 갱신
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

    // 3. 그다음 달 결제 예약 (연쇄 예약)
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
            billingKey,
            orderName: "지원고고 정기 구독",
            customer: { id: customerId },
            amount: { total: 29000 },
            currency: "KRW",
          },
          timeToPay: newEnd.toISOString(),
        }),
      }
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook Error]", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
