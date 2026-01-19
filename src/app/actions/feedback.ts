"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface SubmitFeedbackResult {
  success: boolean;
  error?: string;
}

export async function submitFeedback(data: {
  content: string;
  rating: number;
  pageUrl?: string;
}): Promise<SubmitFeedbackResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!data.content || data.content.trim().length === 0) {
      return { success: false, error: "내용을 입력해주세요." };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "별점은 1에서 5 사이여야 합니다." };
    }

    await prisma.feedback.create({
      data: {
        id: `fb_${Date.now()}`, // Assuming ID is not auto-generated based on error patterns or just to be safe. But wait, schema says String @id usually needs uuid.
        // Checking schema for Feedback model in Step 496:
        // model Feedback { id String @id ... } No default.
        // So I MUST generate ID.
        content: data.content,
        rating: data.rating,
        user_id: userId || null,
        page_url: data.pageUrl,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return {
      success: false,
      error: `의견 제출에 실패했습니다. (${
        error instanceof Error ? error.message : String(error)
      })`,
    };
  }
}
