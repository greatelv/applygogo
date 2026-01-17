import { ProcessingClient } from "@/app/components/processing-client";
import { Locale } from "@/lib/i18n-utils";

export default async function GlobalProcessingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <div className="container py-8">
      <ProcessingClient resumeId={id} locale={locale as Locale} />
    </div>
  );
}
