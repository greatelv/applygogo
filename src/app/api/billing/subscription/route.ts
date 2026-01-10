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

    // 포트원 빌링키 삭제 로직이 필요하다면 여기에 추가 (선택사항)
    // 예: PortOne.requestPaymentScheduleCancel...
    // 현재는 DB에서 '기간 만료 후 해지' 상태로 변경

    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancel_at_period_end: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "구독 해지가 예약되었습니다.",
    });
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
