import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/global-resumes
 * 다국어 이력서 목록 조회
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en"; // 'en' or 'ja'

    const resumes = await prisma.globalResume.findMany({
      where: {
        userId: session.user.id,
        sourceLocale: locale,
      },
      include: {
        work_experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        additionalItems: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching global resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/global-resumes
 * 새 다국어 이력서 생성 (초기 업로드)
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sourceLocale, title, original_file_url, target_role } = body;

    // 유효성 검증
    if (!sourceLocale || !["en", "ja"].includes(sourceLocale)) {
      return NextResponse.json(
        { error: "Invalid sourceLocale. Must be 'en' or 'ja'" },
        { status: 400 },
      );
    }

    if (!original_file_url) {
      return NextResponse.json(
        { error: "original_file_url is required" },
        { status: 400 },
      );
    }

    // 새 이력서 생성
    const resume = await prisma.globalResume.create({
      data: {
        userId: session.user.id,
        sourceLocale,
        targetLocale: "ko", // 항상 한국어
        title: title || `${sourceLocale.toUpperCase()} Resume`,
        original_file_url,
        target_role: target_role || null,
        name_original: "", // AI가 추출할 예정
        status: "IDLE",
        current_step: "UPLOAD",
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating global resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 },
    );
  }
}
