import { SharedDashboardLayout } from "@/app/components/shared-dashboard-layout";

export default async function GlobalResumesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <SharedDashboardLayout locale={locale}>{children}</SharedDashboardLayout>
  );
}
