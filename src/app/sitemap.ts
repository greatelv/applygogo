import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Get all blog posts
  const postsDirectory = path.join(process.cwd(), "content/posts");
  let blogPosts: MetadataRoute.Sitemap = [];

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory);
      blogPosts = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          return {
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          };
        });
    }
  } catch (error) {
    console.error("Error reading blog posts for sitemap:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...blogPosts,
  ];
}
