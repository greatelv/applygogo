import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserGlobalResumes } from "@/lib/global-resume-data";
import { GlobalResumesClient } from "@/app/components/global-resumes-client";
import { Locale } from "@/lib/i18n-utils";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // 해당 로케일의 이력서 데이터 가져오기
  const resumes = await getUserGlobalResumes(locale);

  return (
    <div className="container py-8">
      <GlobalResumesClient resumes={resumes} locale={locale as Locale} />
    </div>
  );
}
