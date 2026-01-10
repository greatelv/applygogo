import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { message: "구독 정보가 없습니다." },
        { status: 404 }
      );
    }

    // 3. 포트원 결제 스케줄 취소 (V2 API)
    // 규칙대로 생성된 다음 결제 ID를 예측하여 취소
    const nextPaymentTime = new Date(user.subscription.current_period_end);
    const nextPaymentId = `sub_${user.id}_${nextPaymentTime.getTime()}`;

    try {
      const cancelRes = await fetch(
        `https://api.portone.io/payment-schedules`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          },
          body: JSON.stringify({
            scheduleIds: [nextPaymentId],
          }),
        }
      );

      if (!cancelRes.ok) {
        console.error(
          "Failed to cancel payment schedule (V2):",
          await cancelRes.text()
        );
        // 실패해도 로직 진행 (Webhook 방어선 있음)
      } else {
        const result = await cancelRes.json();
        console.log("Payment schedule canceled:", result.revokedScheduleIds);
      }
    } catch (err) {
      console.error("Error calling PortOne API:", err);
    }

    // 4. DB 상태 업데이트
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancel_at_period_end: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "구독 해지가 예약되었습니다. 다음 결제일부터 청구되지 않습니다.",
    });
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. 구독 정보 조회
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.billing_key) {
      return NextResponse.json(
        { message: "구독 정보나 결제 수단이 없습니다." },
        { status: 400 }
      );
    }

    // 2. 만료일(다음 결제일)에 맞춰 결제 스케줄 다시 생성
    const nextPaymentTime = new Date(subscription.current_period_end);
    const nextPaymentId = `sub_${userId}_${nextPaymentTime.getTime()}`;

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
            billingKey: subscription.billing_key,
            orderName: "지원고고 PRO 정기 구독",
            customer: {
              id: userId,
              // 필요하다면 이름, 이메일 추가
            },
            amount: {
              total: 9900,
            },
            currency: "KRW",
          },
          timeToPay: nextPaymentTime.toISOString(),
        }),
      }
    );

    if (!scheduleRes.ok) {
      const errorText = await scheduleRes.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // ignore json parse error
      }

      if (errorJson?.type === "PAYMENT_SCHEDULE_ALREADY_EXISTS") {
        console.warn(
          "Payment schedule already exists for this ID. Proceeding with DB update."
        );
      } else {
        console.error("Failed to reschedule payment:", errorText);
        return NextResponse.json(
          { message: "결제 예약 재설정에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    // 3. DB 상태 업데이트 (해지 예약 취소)
    await prisma.subscription.update({
      where: { userId },
      data: {
        cancel_at_period_end: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "해지 예약이 취소되었습니다. 구독이 계속 유지됩니다.",
    });
  } catch (error) {
    console.error("Subscription resume error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
