import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/markdown";
import { markdownToHtml } from "@/lib/markdown-to-html";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";
import { BlogHeader } from "@/app/components/blog/blog-header";
import { SiteFooter as Footer } from "@/app/components/site-footer";
import { AsideCTA } from "@/app/components/blog/aside-cta";
import { BottomCTA } from "@/app/components/blog/bottom-cta";
import { ArticleContent } from "@/app/components/blog/article-content";
import { Breadcrumb } from "@/app/components/blog/breadcrumb";
import { Badge } from "@/app/components/ui/badge";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const locales = ["ko", "en", "ja"];
  const params = [];

  for (const locale of locales) {
    const slugs = getAllPostSlugs(locale);
    params.push(...slugs.map((slug) => ({ locale, slug })));
  }

  return params;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const postUrl = `/blog/${slug}`;

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    keywords: post.frontmatter.tags,
    authors: [{ name: post.frontmatter.author || "고고지기" }],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      url: postUrl,
      publishedTime: new Date(post.frontmatter.date).toISOString(),
      images: [
        {
          url: post.frontmatter.thumbnail,
          alt: post.frontmatter.title,
        },
      ],
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [post.frontmatter.thumbnail],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);
  const articleSchema = generateArticleSchema(post.frontmatter);
  const breadcrumbSchema = generateBreadcrumbSchema(post.frontmatter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BlogHeader />
      <article className="min-h-screen">
        {/* Hero Image */}
        <div className="relative w-full aspect-[21/9] max-h-[500px] overflow-hidden bg-muted/30">
          <Image
            src={post.frontmatter.thumbnail || "/placeholder.svg"}
            alt={post.frontmatter.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Article Header */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb
              items={[
                { label: "전체 아티클", href: "/blog" },
                { label: post.frontmatter.title, href: `/blog/${slug}` },
              ]}
            />
            <div className="flex flex-row items-center gap-4 text-sm text-muted-foreground mb-6">
              {post.frontmatter.categories &&
                post.frontmatter.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.frontmatter.categories.map((category, index) => (
                      <Badge
                        key={category}
                        className={`bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 ${
                          index > 0 ? "hidden sm:inline-flex" : ""
                        }`}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <time
                    className="whitespace-nowrap"
                    dateTime={new Date(post.frontmatter.date).toISOString()}
                  >
                    {new Date(post.frontmatter.date).toLocaleDateString(
                      locale === "ko"
                        ? "ko-KR"
                        : locale === "ja"
                          ? "ja-JP"
                          : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </time>
                </div>
                {post.frontmatter.author && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span className="whitespace-nowrap">
                      {post.frontmatter.author}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-6 text-balance leading-tight">
              {post.frontmatter.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              {post.frontmatter.description}
            </p>
          </div>
        </div>

        {/* Article Content with Sidebar */}
        {/* Added extra padding bottom for mobile fixed CTA */}
        <div className="container mx-auto px-6 pb-32 lg:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="max-w-3xl">
                <ArticleContent content={contentHtml} />

                {/* Tags */}
                <div className="mt-12 flex items-center gap-2 flex-wrap pb-8 border-b border-border/40">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {(post.frontmatter.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Bottom CTA - Desktop: inline, Mobile: fixed bottom */}
                <div className="mt-16 hidden lg:block">
                  <BottomCTA
                    isSponsored={post.frontmatter.isSponsored}
                    relatedServices={post.frontmatter.relatedServices}
                  />
                </div>
              </div>

              {/* Sidebar CTA (Desktop) */}
              <AsideCTA
                isSponsored={post.frontmatter.isSponsored}
                relatedServices={post.frontmatter.relatedServices}
              />
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
          <div className="container mx-auto px-6">
            <BottomCTA
              isSponsored={post.frontmatter.isSponsored}
              relatedServices={post.frontmatter.relatedServices}
              isMobileFixed={true}
            />
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
