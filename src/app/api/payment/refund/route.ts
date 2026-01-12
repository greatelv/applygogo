import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json(
        { message: "Missing paymentId" },
        { status: 400 }
      );
    }

    const secret = process.env.PORTONE_API_SECRET;

    // 1. Get user and the specific payment using Raw SQL for robustness
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const payments = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT * FROM payment_histories 
      WHERE user_id = $1 AND payment_id = $2
      LIMIT 1
    `,
      user.id,
      paymentId
    );

    const targetPayment = payments[0];

    if (!targetPayment || targetPayment.status !== "PAID") {
      return NextResponse.json(
        { message: "Refundable payment not found or already refunded." },
        { status: 400 }
      );
    }

    // Map DB column names (snake_case) to expected property names (camelCase) if needed
    // The Raw SQL query returns snake_case columns if they are defined so in DB
    const initialCredits =
      targetPayment.initial_credits ?? targetPayment.initialCredits;
    const remainingCredits =
      targetPayment.remaining_credits ?? targetPayment.remainingCredits;
    const paymentIdPortOne =
      targetPayment.payment_id ?? targetPayment.paymentId;
    const paidAtRaw = targetPayment.paid_at ?? targetPayment.paidAt;
    const orderName = targetPayment.order_name ?? targetPayment.orderName;

    // 2. Eligibility Check
    // Rule 1: Within 7 days
    const paidAt = new Date(paidAtRaw);
    const now = new Date();
    const diffDays = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return NextResponse.json(
        { message: "Refund is only possible within 7 days of purchase." },
        { status: 400 }
      );
    }

    // Rule 2: Credits must be unused (remaining == initial)
    if (remainingCredits < initialCredits) {
      return NextResponse.json(
        {
          message:
            "Refund is not possible if any of the credits from this payment have been used.",
        },
        { status: 400 }
      );
    }

    // 3. PortOne Refund (Cancel) API call
    const refundRes = await fetch(
      `https://api.portone.io/payments/${paymentIdPortOne}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "사용자 요청 환불 (7일 이내 및 미사용)",
        }),
      }
    );

    if (!refundRes.ok) {
      const errorData = await refundRes.json().catch(() => ({}));
      console.error("PortOne refund failed:", errorData);

      // 만약 이미 취소된 건이라면 (PortOne V2: ALREADY_CANCELLED 등)
      // 우리 DB만 업데이트하면 되므로 성공으로 간주하고 진행
      const isAlreadyCancelled =
        refundRes.status === 409 ||
        JSON.stringify(errorData).includes("ALREADY_CANCELLED") ||
        JSON.stringify(errorData).includes("이미 취소된");

      if (!isAlreadyCancelled) {
        return NextResponse.json(
          { message: errorData.message || "External refund process failed." },
          { status: refundRes.status }
        );
      }

      console.log(
        "Payment already cancelled in PortOne, proceeding with DB update."
      );
    }

    // 4. Update Database
    await prisma.$transaction(async (tx) => {
      // [Security] Double check remaining credits inside transaction using Raw SQL
      const bucketsInsideTx = await tx.$queryRawUnsafe<any[]>(
        `
        SELECT remaining_credits, initial_credits
        FROM payment_histories
        WHERE id = $1
      `,
        targetPayment.id
      );

      const bucketInsideTx = bucketsInsideTx[0];
      const currentRemaining =
        bucketInsideTx?.remaining_credits ?? bucketInsideTx?.remainingCredits;
      const currentInitial =
        bucketInsideTx?.initial_credits ?? bucketInsideTx?.initialCredits;

      if (!bucketInsideTx || currentRemaining < currentInitial) {
        throw new Error("환불 처리 중 크레딧 사용이 감지되었습니다.");
      }

      const isPass = orderName.includes("이용권");
      const creditsToRevoke = initialCredits;

      // Update User State
      if (isPass) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            planType: "FREE",
            planExpiresAt: null,
            credits: {
              decrement: creditsToRevoke,
            },
          },
        });
      } else {
        await tx.user.update({
          where: { id: user.id },
          data: {
            credits: {
              decrement: creditsToRevoke,
            },
          },
        });
      }

      // Update Payment Status using Raw SQL
      await tx.$executeRawUnsafe(
        `
        UPDATE payment_histories
        SET status = 'REFUNDED', remaining_credits = 0
        WHERE id = $1
      `,
        targetPayment.id
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
