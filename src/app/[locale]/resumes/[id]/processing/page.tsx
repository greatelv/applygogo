import { GlobalProcessingClient } from "@/app/components/global-processing-client";
import { Locale } from "@/lib/i18n-utils";

export default async function GlobalProcessingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <div className="container py-8">
      <GlobalProcessingClient resumeId={id} locale={locale as Locale} />
    </div>
  );
}
