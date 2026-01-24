import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (e) {
      console.warn(
        "Auth check failed in survey API, proceeding as anonymous:",
        e,
      );
    }

    const body = await req.json();
    const { code, answer } = body;

    if (!code || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = session?.user?.id || null;

    const response = await prisma.surveyResponse.create({
      data: {
        code,
        answer,
        user_id: userId,
      },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
