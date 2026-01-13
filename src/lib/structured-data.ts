import type { PostFrontmatter } from "./markdown";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teep.pe.kr";

export function generateArticleSchema(post: PostFrontmatter) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.thumbnail,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author || "티입지기",
    },
    publisher: {
      "@type": "Organization",
      name: "TEEP",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    keywords: (post.tags || []).join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/posts/${post.slug}`,
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
    { name: "전체 아티클", item: "/articles" },
    { name: post.title, item: `/posts/${post.slug}` },
  ]);
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TEEP",
    alternateName: "티입",
    description: "당신의 생활을 업그레이드하는 종합 서비스 꿀팁",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TEEP",
    description: "당신의 생활을 업그레이드하는 종합 서비스 꿀팁",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
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
      name: "TEEP",
      url: SITE_URL,
    },
  };
}
