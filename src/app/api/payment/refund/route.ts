import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    // 1. Get the payment securely
    // We check both 'id' (PK) and 'paymentId' (PortOne ID) to be safe,
    // ensuring it belongs to the authenticated user.
    const targetPayment = await prisma.paymentHistory.findFirst({
      where: {
        userId: session.user.id,
        OR: [{ id: paymentId }, { paymentId: paymentId }],
      },
    });

    if (!targetPayment || targetPayment.status !== "PAID") {
      return NextResponse.json(
        { message: "Refundable payment not found or already refunded." },
        { status: 400 }
      );
    }

    // Ensure we are working with Numbers
    const initialCredits = Number(targetPayment.initialCredits);
    const remainingCredits = Number(targetPayment.remainingCredits);
    const paidAt = new Date(targetPayment.paidAt);
    const orderName = targetPayment.orderName;
    const paymentIdPortOne = targetPayment.paymentId;

    // 2. Eligibility Check
    // Rule 1: Within 7 days
    const now = new Date();
    const diffDays = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return NextResponse.json(
        { message: "Refund is only possible within 7 days of purchase." },
        { status: 400 }
      );
    }

    // Rule 2: Credits must be unused (remaining == initial)
    // Using explicit number comparison to avoid string logic errors
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
          reason: "User requested refund (within 7 days & unused)",
        }),
      }
    );

    if (!refundRes.ok) {
      const errorData = await refundRes.json().catch(() => ({}));
      console.error("PortOne refund failed:", errorData);

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
      // [Security] Double check remaining credits inside transaction
      // Fetch latest state
      const currentPayment = await tx.paymentHistory.findUnique({
        where: { id: targetPayment.id },
      });

      if (!currentPayment) {
        throw new Error("Payment record missing during transaction.");
      }

      const currentRemaining = Number(currentPayment.remainingCredits);
      const currentInitial = Number(currentPayment.initialCredits);

      if (currentRemaining < currentInitial) {
        throw new Error("Credit usage detected during refund processing.");
      }

      // Check if already refunded (double safety)
      if (currentPayment.status === "REFUNDED") {
        return; // Already processed
      }

      const isPass = orderName.includes("Pass");
      const creditsToRevoke = currentInitial;

      // Update User State
      if (isPass) {
        await tx.user.update({
          where: { id: session.user.id },
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
          where: { id: session.user.id },
          data: {
            credits: {
              decrement: creditsToRevoke,
            },
          },
        });
      }

      // Update Payment Status
      await tx.paymentHistory.update({
        where: { id: targetPayment.id },
        data: {
          status: "REFUNDED",
          remainingCredits: 0,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
