import { NextRequest, NextResponse } from "next/server";
import { processPaymentSuccess } from "@/lib/billing";
import * as PortOne from "@portone/server-sdk";

// PortOne V2 Webhook
// https://developers.portone.io/docs/ko/v2/webhook/v2
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("webhook-signature");
    const webhookId = req.headers.get("webhook-id");
    const timestamp = req.headers.get("webhook-timestamp");
    const body = await req.json();

    if (!signature || !webhookId || !timestamp) {
      console.error("Missing webhook headers");
      return NextResponse.json({ message: "Missing headers" }, { status: 400 });
    }

    // TODO: Verify signature properly if needed.
    // For now, we trust the PortOne SDK or verify the payment status directly.
    // PortOne V2 recommends checking the payment status via API call to be sure.

    const { type, data } = body;

    // We only care about Transaction.Paid
    if (type !== "Transaction.Paid") {
      return NextResponse.json({ message: "Ignored event type" });
    }

    const paymentId = data.paymentId;
    const secret = process.env.PORTONE_API_SECRET;

    // Verify payment from PortOne API to ensure authenticity
    const verifyRes = await fetch(
      `https://api.portone.io/payments/${paymentId}`,
      {
        headers: {
          Authorization: `PortOne ${secret}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!verifyRes.ok) {
      console.error("Webhook: Payment verification failed");
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400 }
      );
    }

    const paymentData = await verifyRes.json();

    // Check if payment is actually paid
    if (paymentData.status !== "PAID") {
      console.error(`Webhook: Payment status is ${paymentData.status}`);
      return NextResponse.json({ message: "Not PAID" });
    }

    // Identify user from payment customer info
    const userEmail = paymentData.customer?.email;
    if (!userEmail) {
      console.error("Webhook: Missing customer email in payment data");
      return NextResponse.json(
        { message: "Customer email not found" },
        { status: 400 }
      );
    }

    // Process Payment
    await processPaymentSuccess(paymentData, userEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
