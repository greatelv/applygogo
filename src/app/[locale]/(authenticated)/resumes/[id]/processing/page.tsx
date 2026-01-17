import { ProcessingPage } from "@/app/components/processing-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProcessingPage resumeTitle="이력서 처리 중..." resumeId={id} />;
}
