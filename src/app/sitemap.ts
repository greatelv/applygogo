import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";
  const locales = ["ko", "en", "ja"];
  const routes = ["", "/login", "/privacy", "/terms", "/blog"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 각 로케일별로 경로 생성
  locales.forEach((locale) => {
    routes.forEach((route) => {
      let priority = 0.5;
      let changeFreq: any = "yearly";

      if (route === "") {
        priority = 1;
        changeFreq = "daily";
      } else if (route === "/blog") {
        priority = 0.8;
        changeFreq = "daily";
      } else if (route === "/login") {
        priority = 0.8;
        changeFreq = "monthly";
      }

      // URL 생성 (한국어는 /, 영어/일본어는 /[locale])
      const url =
        locale === "ko" ? `${baseUrl}${route}` : `${baseUrl}/${locale}${route}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: changeFreq,
        priority,
        alternates: {
          languages: {
            ko: `${baseUrl}${route}`,
            en: `${baseUrl}/en${route}`,
            ja: `${baseUrl}/ja${route}`,
          },
        },
      });
    });
  });

  // 블로그 포스트 (한국어만)
  try {
    const postsDirectory = path.join(process.cwd(), "content/posts");
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory);
      fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .forEach((fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          sitemapEntries.push({
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: {
              languages: {
                ko: `${baseUrl}/blog/${slug}`,
              },
            },
          });
        });
    }
  } catch (error) {
    console.error("Error reading blog posts for sitemap:", error);
  }

  return sitemapEntries;
}
