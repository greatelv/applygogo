import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { locales } from "../i18n/config";

const STATIC_ROUTES = [
  "",
  "/blog",
  "/login",
  "/privacy",
  "/terms",
  "/company",
  "/introduction",
  "/release-notes",
];

function staticRouteMeta(route: string): {
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
} {
  if (route === "") return { priority: 1, changeFrequency: "daily" };
  if (route === "/blog") return { priority: 0.8, changeFrequency: "daily" };
  if (route === "/login") return { priority: 0.8, changeFrequency: "monthly" };
  if (route === "/release-notes")
    return { priority: 0.5, changeFrequency: "weekly" };
  return { priority: 0.5, changeFrequency: "yearly" };
}

function readPostLastModified(
  postsDir: string,
  fileName: string,
): Date {
  const fullPath = path.join(postsDir, fileName);
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);
    if (data?.date) {
      const ts = typeof data.date === "string" ? Number(data.date) : data.date;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  try {
    return fs.statSync(fullPath).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const buildTime = new Date();

  // Index posts per slug across all locales for cross-locale alternates.
  const slugLocaleMap = new Map<string, Set<string>>();
  for (const locale of locales) {
    const dir = path.join(process.cwd(), `content/posts/${locale}`);
    if (!fs.existsSync(dir)) continue;
    for (const fileName of fs.readdirSync(dir)) {
      if (!fileName.endsWith(".md") && !fileName.endsWith(".mdx")) continue;
      const slug = fileName.replace(/\.(md|mdx)$/, "");
      const set = slugLocaleMap.get(slug) ?? new Set<string>();
      set.add(locale);
      slugLocaleMap.set(slug, set);
    }
  }

  // Static routes — equivalent translations across locales → full alternates + x-default.
  for (const locale of locales) {
    for (const route of STATIC_ROUTES) {
      const { priority, changeFrequency } = staticRouteMeta(route);
      const pathWithLocale = `/${locale}${route}`;
      sitemapEntries.push({
        url: `${baseUrl}${pathWithLocale}`,
        lastModified: buildTime,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ...locales.reduce(
              (acc, l) => {
                acc[l] = `${baseUrl}/${l}${route}`;
                return acc;
              },
              {} as Record<string, string>,
            ),
            "x-default": `${baseUrl}${route}`,
          },
        },
      });
    }
  }

  // Blog posts — alternates only for locales where the same slug actually exists.
  for (const locale of locales) {
    const postsDirectory = path.join(process.cwd(), `content/posts/${locale}`);
    if (!fs.existsSync(postsDirectory)) continue;

    const fileNames = fs
      .readdirSync(postsDirectory)
      .filter((n) => n.endsWith(".md") || n.endsWith(".mdx"));

    for (const fileName of fileNames) {
      const slug = fileName.replace(/\.(md|mdx)$/, "");
      const postPath = `/${locale}/blog/${slug}`;
      const availableLocales = Array.from(
        slugLocaleMap.get(slug) ?? new Set([locale]),
      );

      const languages: Record<string, string> = {};
      for (const l of availableLocales) {
        languages[l] = `${baseUrl}/${l}/blog/${slug}`;
      }
      // x-default points to the highest-priority available locale (ko > en > ja).
      const defaultLocale =
        ["ko", "en", "ja"].find((l) => availableLocales.includes(l)) ?? locale;
      languages["x-default"] = `${baseUrl}/${defaultLocale}/blog/${slug}`;

      sitemapEntries.push({
        url: `${baseUrl}${postPath}`,
        lastModified: readPostLastModified(postsDirectory, fileName),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return sitemapEntries;
}
