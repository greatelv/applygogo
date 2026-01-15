import type { PostFrontmatter } from "./markdown";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";

export function generateArticleSchema(post: PostFrontmatter) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.thumbnail?.startsWith("http")
      ? post.thumbnail
      : `${SITE_URL}${post.thumbnail}`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      "@type": "Person",
      name: post.author || "고고지기",
    },
    publisher: {
      "@type": "Organization",
      name: "지원고고",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-for-light.svg`,
      },
    },
    keywords: (post.tags || []).join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item.startsWith("http")
        ? item.item
        : `${SITE_URL}${item.item}`,
    })),
  };
}

export function generateBreadcrumbSchema(post: PostFrontmatter) {
  return generateBreadcrumbListSchema([
    { name: "홈", item: "/" },
    { name: "블로그", item: "/blog" },
    { name: post.title, item: `/blog/${post.slug}` },
  ]);
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "지원고고",
    alternateName: "Applygogo",
    description:
      "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 만들어보세요.",
    url: SITE_URL,
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "지원고고",
    description:
      "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 만들어보세요.",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo-for-light.svg`,
    },
    sameAs: [],
  };
}

export function generateCollectionPageSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "지원고고",
      url: SITE_URL,
    },
  };
}
