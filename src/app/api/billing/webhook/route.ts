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

    // 카드 정보 추출
    const method = payment.method;
    const card = method?.card;
    const cardName = card?.publisher?.name || card?.name || undefined;
    const cardNumber = card?.number || card?.mask_no || undefined;

    // 2. DB 구독 정보 확인 (해지 예약 여부 체크)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: customerId },
    });

    if (!subscription) {
      console.error("Subscription not found for user:", customerId);
      return NextResponse.json({ received: true });
    }

    // Fail-Safe: 해지 예약된 사용자의 결제인 경우 -> 즉시 환불 및 완전 해지 처리
    if (subscription.cancel_at_period_end) {
      console.log(
        `Payment ${paymentId} occurred for canceled user ${customerId}. Auto-refunding.`
      );

      // 환불 요청
      await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(
          paymentId
        )}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          },
          body: JSON.stringify({
            reason: "해지 예약 계정 자동 결제 방지 환불",
          }),
        }
      );

      // DB 완전 해지 처리
      await prisma.subscription.update({
        where: { userId: customerId },
        data: {
          planCode: "FREE",
          status: "CANCELED",
          cancel_at_period_end: false,
          current_period_end: new Date(), // 즉시 종료
          billing_key: null,
          card_name: null,
          card_number: null,
        },
      });

      return NextResponse.json({ received: true, status: "refined_canceled" });
    }

    // 3. 정상 갱신 처리
    const newStart = new Date();
    const newEnd = new Date(newStart);
    newEnd.setMonth(newEnd.getMonth() + 1);

    await prisma.subscription.update({
      where: { userId: customerId },
      data: {
        current_period_start: newStart,
        current_period_end: newEnd,
        status: "ACTIVE",
        card_name: cardName,
        card_number: cardNumber,
      },
    });

    // 3-1. 결제 내역 기록 (PaymentHistory)
    try {
      await prisma.paymentHistory.create({
        data: {
          userId: customerId,
          paymentId: paymentId,
          orderName: payment.orderName || "정기 구독 결제",
          amount: payment.amount.total,
          currency: payment.amount.currency || "KRW",
          status: "PAID",
          method: cardName || "간편결제", // 간단하게 저장
          paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
          receiptUrl: payment.receiptUrl,
        },
      });
    } catch (historyErr) {
      console.error("Failed to save payment history:", historyErr);
      // 메인 로직에는 영향 주지 않음
    }

    // 4. 그다음 달 결제 예약 (연쇄 예약)
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
            orderName: "지원고고 PRO 정기 구독",
            customer: { id: customerId },
            amount: { total: 12900 },
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
