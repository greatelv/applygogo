import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all blog posts
  const postsDirectory = path.join(process.cwd(), "content/posts");
  let blogPostSlugs: string[] = [];

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory);
      blogPostSlugs = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => fileName.replace(/\.md$/, ""));
    }
  } catch (error) {
    console.error("Error reading blog posts for sitemap:", error);
  }

  const routes = ["", "/blog", "/login", "/privacy", "/terms"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper to generate entries for a path
  const addEntriesForPath = (
    routePath: string,
    changeFreq: any,
    priority: number
  ) => {
    const koUrl = `${baseUrl}${routePath}`;
    const enUrl = `${baseUrl}/en${routePath}`;

    const alternates = {
      languages: {
        ko: koUrl,
        en: enUrl,
      },
    };

    // English Locale (en) - /en prefix
    // Only push English URL for the global site
    sitemapEntries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority: priority,
      alternates: alternates,
    });
  };

  // 1. Static Routes
  routes.forEach((route) => {
    let priority = 0.5;
    let changeFreq = "yearly";

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

    addEntriesForPath(route, changeFreq, priority);
  });

  // 2. Blog Posts
  blogPostSlugs.forEach((slug) => {
    addEntriesForPath(`/blog/${slug}`, "weekly", 0.7);
  });

  return sitemapEntries;
}
