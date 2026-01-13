import { getAllPosts } from "@/lib/markdown";
import { BlogHeader } from "@/app/components/blog/blog-header";
import { SiteFooter as Footer } from "@/app/components/site-footer";
import { PostCard } from "@/app/components/blog/post-card";
import Link from "next/link";
import { ServiceTicker } from "@/app/components/blog/service-ticker";
import { NewsletterForm } from "@/app/components/blog/newsletter-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "지원고고 블로그 - 글로벌 커리어를 위한 인사이트",
  description:
    "영문 이력서 작성 팁부터 해외 취업 성공 사례까지, 당신의 글로벌 성장을 돕는 정보를 확인하세요.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "지원고고 블로그 - 글로벌 커리어를 위한 인사이트",
    description:
      "영문 이력서 작성 팁부터 해외 취업 성공 사례까지, 당신의 글로벌 성장을 돕는 정보를 확인하세요.",
    type: "website",
    locale: "ko_KR",
    url: "/blog",
    siteName: "지원고고",
  },
};

export default function HomePage() {
  const allPosts = getAllPosts();
  const latestPost = allPosts[0];
  const listPosts = allPosts.slice(1);

  return (
    <>
      <BlogHeader />
      <main className="min-h-screen">
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-border/40">
          <div className="container mx-auto px-6 relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 md:mb-12">
              지금 봐야할 추천 컨텐츠
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left: Latest Content Card */}
              {latestPost && (
                <Link
                  href={`/blog/${latestPost.frontmatter.slug}`}
                  className="group block rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                    <img
                      src={
                        latestPost.frontmatter.thumbnail || "/placeholder.svg"
                      }
                      alt={latestPost.frontmatter.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {latestPost.frontmatter.categories &&
                      latestPost.frontmatter.categories.length > 0 && (
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {latestPost.frontmatter.categories.map((category) => (
                            <div
                              key={category}
                              className="px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur-sm border border-border text-xs font-medium shadow-sm"
                            >
                              {category}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="p-6 space-y-3">
                    {latestPost.frontmatter.categories &&
                      latestPost.frontmatter.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {latestPost.frontmatter.categories.map(
                            (category, index) => (
                              <span key={category}>
                                {category}
                                {index <
                                  latestPost.frontmatter.categories.length -
                                    1 && " · "}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {latestPost.frontmatter.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {latestPost.frontmatter.description}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {new Date(latestPost.frontmatter.date).toLocaleDateString(
                        "ko-KR",
                        {
                          timeZone: "Asia/Seoul",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Right: Service Tagline */}
              <div className="rounded-xl overflow-hidden bg-card border border-border shadow-sm p-8 md:p-12 flex flex-col justify-center items-center text-center">
                <div className="space-y-8 w-full">
                  <div className="space-y-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-balance">
                      <span className="text-foreground">
                        당신의 커리어를 <br />
                        글로벌로 연결합니다
                      </span>
                    </h1>
                  </div>

                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
                    영문 이력서 작성법, 해외 취업 팁, 그리고 커리어 성장을 위한
                    다양한 정보를 지원고고 블로그에서 만나보세요.
                  </p>

                  <NewsletterForm />

                  <div className="-mx-8 md:-mx-12 pt-4">
                    <ServiceTicker />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  전체 아티클
                </h2>
                <p className="text-lg text-muted-foreground">
                  지원고고의 최신 소식과 커리어 팁을 확인하세요
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listPosts.map((post) => (
                <PostCard key={post.frontmatter.slug} post={post.frontmatter} />
              ))}
            </div>

            {allPosts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                아직 게시글이 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
