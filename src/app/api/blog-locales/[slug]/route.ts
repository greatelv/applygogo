import { NextResponse } from "next/server";
import { getAvailableLocalesForSlug } from "@/lib/markdown";

export const dynamic = "force-static";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const available = getAvailableLocalesForSlug(slug);
  return NextResponse.json({ slug, available });
}
