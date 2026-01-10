import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "patakeique@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true },
  });
  return NextResponse.json(user);
}
