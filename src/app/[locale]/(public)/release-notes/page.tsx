import { getAllReleaseNotes } from "@/lib/release-notes";
import { PublicHeader } from "@/app/components/header";
import { SiteFooter as Footer } from "@/app/components/site-footer";
import { getTranslations, getLocale } from "next-intl/server";
import { Badge } from "@/app/components/ui/badge";
import { Calendar, Tag } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.header" });

  return {
    title: `${t("releaseNotes")} | ${locale === "ko" ? "지원고고" : "ApplyGogo"}`,
    description:
      locale === "ko"
        ? "지원고고의 최신 업데이트 소식과 제품 개선 내역을 확인하세요."
        : "Check out the latest updates and product improvements from ApplyGogo.",
  };
}

export default async function ReleaseNotesPage() {
  const locale = await getLocale();
  const th = await getTranslations({ locale, namespace: "common.header" });
  const notes = getAllReleaseNotes(locale);
  const isKo = locale === "ko";

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background">
        <section className="py-16 md:py-24 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-3">
              {isKo ? "지원고고 업데이트" : "ApplyGogo updates"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {th("releaseNotes")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isKo
                ? "더 나은 제품을 만들기 위한 지원고고 팀의 노력을 확인해보세요. 매주 새로운 기능과 개선 사항이 업데이트됩니다."
                : "Check out the ApplyGogo team's efforts to create a better product. New features and improvements are updated every week."}
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="relative border-l-2 border-border/50 ml-6 md:ml-[160px] space-y-16">
              {notes.map((note) => (
                <div key={note.version} className="relative pl-8 md:pl-12">
                  {/* Timeline dot: Centered on the line */}
                  <div className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-primary ring-4 ring-background shadow-sm" />

                  <div className="flex flex-col">
                    {/* Date/Version Column: On desktop, move to the left of the line */}
                    <div className="md:absolute md:-left-[160px] md:w-[140px] md:text-right mb-2 md:mb-0">
                      <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">
                        {note.week}
                      </div>
                      <div className="flex items-center md:justify-end text-xs font-medium text-muted-foreground/80">
                        <Calendar className="size-3 mr-1.5" />
                        {note.date}
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className="font-mono flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Tag className="size-3" />v{note.version}
                        </Badge>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
                        {note.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {note.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
                등록된 릴리즈 노트가 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
