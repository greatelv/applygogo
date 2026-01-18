import { getAllPosts } from "@/lib/markdown";
import { PublicHeader } from "@/app/components/header";
import { SiteFooter as Footer } from "@/app/components/site-footer";
import { PostCard } from "@/app/components/blog/post-card";
import { Link } from "@/i18n/routing";
import { Button } from "@/app/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/blog",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale,
      url: "/blog",
      siteName: "ApplyGogo",
    },
  };
}

export default function HomePage() {
  const t = useTranslations("blog");
  const format = useFormatter();
  const locale = useLocale();
  const allPosts = getAllPosts();
  // Filter posts based on locale if needed, or translate post content dynamically.
  // For now, assuming posts are handled or we show all.
  // Ideally, markdown posts should be locale-specific folders or frontmatter.
  // But strictly adhering to UI localization here.

  const latestPost = allPosts[0];
  const listPosts = allPosts.slice(1);

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-border/40">
          <div className="container mx-auto px-6 relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 md:mb-12">
              {t("recommended")}
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
                            ),
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
                      {format.dateTime(new Date(latestPost.frontmatter.date), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              )}

              {/* Right: Service Tagline */}
              <div className="rounded-xl overflow-hidden bg-card border border-border shadow-sm p-8 md:p-12 flex flex-col justify-center items-center text-center">
                <div className="space-y-8 w-full max-w-md">
                  <div className="space-y-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-balance">
                      <span className="text-foreground">
                        {t.rich("tagline.title", {
                          br: () => <br />,
                        })}
                      </span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                      {t.rich("tagline.description", {
                        br: () => <br className="hidden md:block" />,
                      })}
                    </p>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-xl py-8 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
                  >
                    <Link href="/">
                      {t("tagline.cta")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
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
                  {t("allPosts.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("allPosts.subtitle")}
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
                {t("allPosts.empty")}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
