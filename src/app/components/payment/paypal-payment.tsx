"use client";

import { useEffect, useRef } from "react";
import * as PortOne from "@portone/browser-sdk/v2";

interface PayPalPaymentProps {
  storeId: string;
  channelKey: string;
  orderName: string;
  amount: number;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  onSuccess: (paymentId: string) => void;
  onError: (msg: string) => void;
}

export function PayPalPayment({
  storeId,
  channelKey,
  orderName,
  amount,
  user,
  onSuccess,
  onError,
}: PayPalPaymentProps) {
  // Use a ref to ensure we don't try to load multiple times for the same config
  const loadedRef = useRef(false);
  const containerId = `portone-ui-container-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  useEffect(() => {
    async function load() {
      // Small delay to ensure container is in DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        await PortOne.loadPaymentUI(
          {
            storeId,
            channelKey,
            paymentId: `payment-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            orderName,
            totalAmount: amount * 100, // USD cents for PayPal SPB
            currency: "USD",
            uiType: "PAYPAL_SPB",
            locale: "EN_US",
            customer: {
              customerId: user.id,
              fullName: user.name || undefined,
              email: user.email || undefined,
            },
          },
          {
            onPaymentSuccess: (response: any) => {
              onSuccess(response.paymentId);
            },
            onPaymentFail: (error: any) => {
              let message = error.message || "Payment failed";
              if (message === "사용자가 결제를 취소하였습니다.") {
                message = "Payment cancelled by user.";
              }
              onError(message);
            },
          }
        );
      } catch (e: any) {
        const errorMessage = e?.message || String(e);
        // Suppress expected errors like popup close
        if (errorMessage.includes("Detected popup close")) {
          onError("Payment cancelled");
          return;
        }
        console.error(e);
        onError("Failed to load payment UI");
      }
    }

    load();

    return () => {
      // Cleanup if needed? PortOne SDK doesn't seem to have explicit cleanup for loadPaymentUI other than removing container content.
    };
  }, [storeId, channelKey, orderName, amount, user]); // Include shallow deps

  return (
    <div className="w-full flex justify-center">
      <div
        id={containerId}
        className="portone-ui-container w-full"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
