import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { locales } from "../i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";
  const routes = ["", "/blog", "/login", "/privacy", "/terms"];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper to process routes for each locale
  locales.forEach((locale) => {
    // 1. Static Routes
    routes.forEach((route) => {
      let priority = 0.5;
      let changeFreq: "daily" | "weekly" | "monthly" | "yearly" = "yearly";

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

      // Generate localized path (e.g., /ko, /ko/blog)
      // Note: routes need slash prefix except for root if we want strict joining,
      // but here route "" -> /ko, route "/blog" -> /ko/blog
      const pathWithLocale = `/${locale}${route}`; // e.g., /ko, /ko/blog

      sitemapEntries.push({
        url: `${baseUrl}${pathWithLocale}`,
        lastModified: new Date(),
        changeFrequency: changeFreq,
        priority: priority,
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
    });

    // 2. Blog Posts
    // Read from content/posts/{locale}
    const postsDirectory = path.join(process.cwd(), `content/posts/${locale}`);
    try {
      if (fs.existsSync(postsDirectory)) {
        const fileNames = fs.readdirSync(postsDirectory);
        fileNames
          .filter((fileName) => fileName.endsWith(".md"))
          .forEach((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const postPath = `/${locale}/blog/${slug}`;

            // For blog posts, if we don't have a mapping map, we just list the URL
            // If you implement cross-language slug mapping later, update alternates here.
            sitemapEntries.push({
              url: `${baseUrl}${postPath}`,
              lastModified: new Date(),
              changeFrequency: "weekly",
              priority: 0.7,
              // Without known mapping, self-referencing alternate is minimal safety
              alternates: {
                languages: {
                  [locale]: `${baseUrl}${postPath}`,
                },
              },
            });
          });
      }
    } catch (error) {
      console.error(`Error reading blog posts for locale ${locale}:`, error);
    }
  });

  return sitemapEntries;
}
