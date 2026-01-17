import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Get all blog posts
  const postsDirectory = path.join(process.cwd(), "content/posts");
  const routes = ["", "/blog", "/login", "/privacy", "/terms"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper to add entry with alternates
  const addEntry = (path: string, changeFreq: any, priority: number) => {
    // Only include Korean URLs in this sitemap
    // But include reference to English alternate
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority: priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${path}`,
        },
      },
    });
  };

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

    addEntry(route, changeFreq, priority);
  });

  // Blog posts
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory);
      fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .forEach((fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          addEntry(`/blog/${slug}`, "weekly", 0.7);
        });
    }
  } catch (error) {
    console.error("Error reading blog posts for sitemap:", error);
  }

  return sitemapEntries;
}
