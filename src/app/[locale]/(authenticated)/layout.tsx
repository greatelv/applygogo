import { SharedServiceLayout } from "@/app/components/shared-service-layout";

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SharedServiceLayout locale={locale}>{children}</SharedServiceLayout>;
}
