import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/en/", "/ja/"],
      disallow: [
        "/api/",
        "/resumes/",
        "/dashboard/",
        "/settings/",
        "/help/",
        "/*/dashboard/", // 다국어 대시보드
        "/*/global-resume/", // 다국어 이력서 편집
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
