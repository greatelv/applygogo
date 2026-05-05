import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/markdown";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const SITE_NAME: Record<string, string> = {
  ko: "지원고고 블로그",
  en: "ApplyGogo Blog",
  ja: "ApplyGogoブログ",
};

const SITE_DESCRIPTION: Record<string, string> = {
  ko: "글로벌 커리어를 위한 인사이트",
  en: "Insights for your global career",
  ja: "グローバルキャリアのためのインサイト",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";
  const posts = getAllPosts(locale).slice(0, 30);
  const updated =
    posts.length > 0
      ? new Date(posts[0].frontmatter.date).toISOString()
      : new Date().toISOString();

  const feedUrl = `${baseUrl}/${locale}/rss.xml`;
  const blogUrl = `${baseUrl}/${locale}/blog`;

  const entries = posts
    .map((p) => {
      const slug = p.frontmatter.slug;
      const url = `${baseUrl}/${locale}/blog/${slug}`;
      const isoDate = new Date(p.frontmatter.date).toISOString();
      return `  <entry>
    <title>${escapeXml(p.frontmatter.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${isoDate}</updated>
    <published>${isoDate}</published>
    <summary>${escapeXml(p.frontmatter.description ?? "")}</summary>
    <author><name>${escapeXml(p.frontmatter.author ?? "ApplyGogo")}</name></author>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <title>${escapeXml(SITE_NAME[locale] ?? "ApplyGogo Blog")}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION[locale] ?? "")}</subtitle>
  <link href="${feedUrl}" rel="self" type="application/atom+xml"/>
  <link href="${blogUrl}" rel="alternate" type="text/html"/>
  <id>${feedUrl}</id>
  <updated>${updated}</updated>
${entries}
</feed>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
