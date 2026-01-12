import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");

    // 1. 포트원 API 조회 (과거 내역 포함)
    const apiUrl = `https://api.portone.io/payments?customer.id=${userId}&sort.by=requested_at&sort.order=desc&page.size=20&page.number=${page}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PortOne API Error:", errorText);
      return NextResponse.json({ items: [] });
    }

    const data = await response.json();
    const allItems = data.items || [];

    // 2. [필수] 서버 사이드 보안 필터링: 내 결제 내역 중 완료된 건만 골라내기
    const myItems = allItems.filter(
      (item: any) =>
        item.customer && item.customer.id === userId && item.status === "PAID"
    );

    const history = myItems.map((item: any) => {
      let methodLabel = "카드";
      if (item.method && typeof item.method === "object") {
        if (item.method.card && item.method.card.name) {
          methodLabel = item.method.card.name;
        } else if (item.method.type) {
          methodLabel = mapMethodType(item.method.type);
        }
      } else if (typeof item.method === "string") {
        methodLabel = mapMethodType(item.method);
      }

      return {
        id: item.id,
        name: item.orderName,
        amount: item.amount.total,
        currency: item.amount.currency,
        status: item.status,
        paidAt: item.paidAt,
        receiptUrl: item.receiptUrl || "",
        method: methodLabel,
      };
    });

    return NextResponse.json({ items: history });
  } catch (error) {
    console.error("Fetch payment history error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
// mapMethodType 함수는 더이상 필요하지 않거나 method 필드 저장 시 사용되었으므로 여기서 제거해도 무방하지만 helper로 남겨두거나 삭제.

function mapMethodType(typeString: string): string {
  if (!typeString) return "결제";

  const lower = typeString.toLowerCase();

  if (lower.includes("easypay") || lower.includes("easy")) return "간편결제";
  if (lower.includes("card")) return "신용/체크카드";
  if (lower.includes("transfer")) return "실시간 계좌이체";
  if (lower.includes("virtual")) return "가상계좌";
  if (lower.includes("mobile")) return "휴대폰 결제";
  if (lower.includes("gift")) return "상품권";

  return "기타 결제수단";
}
