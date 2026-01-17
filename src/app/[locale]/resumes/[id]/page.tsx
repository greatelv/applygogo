import { redirect, notFound } from "next/navigation";
import { getUserGlobalResume } from "@/lib/global-resume-data";

export default async function ResumeDispatcherPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resume = await getUserGlobalResume(id);

  if (!resume) {
    notFound();
  }

  // Redirect based on current status/step
  if (resume.currentStep === "UPLOAD") {
    // 만약 업로드만 하고 처리가 안 된 상태라면 다시 업로드로? 아니면 처리로?
    // 보통 업로드 직후엔 PROCESSING으로 넘어감.
    redirect(`/${locale}/resumes/new`);
  } else if (resume.currentStep === "PROCESSING") {
    redirect(`/${locale}/resumes/${id}/processing`);
  } else if (resume.currentStep === "EDIT") {
    redirect(`/${locale}/resumes/${id}/edit`); // 아직 미구현
  } else if (resume.currentStep === "TEMPLATE") {
    redirect(`/${locale}/resumes/${id}/templates`); // 아직 미구현
  } else if (resume.currentStep === "COMPLETED") {
    // 완료된 상태면 상세 뷰를 보여주거나 다운로드 뷰로
    // 한국향은 DetailClient를 바로 렌더링함.
    // 여기서도 DetailClient 역할을 하는 GlobalResumeDetail를 렌더링해야 함.
    // 일단은 "완료"라고 텍스트만 띄우겠습니다. (아직 Detail View 미구현)
    return <div>Resume Completed (Detail View Coming Soon)</div>;
  }

  return <div>Unknown Status: {resume.status}</div>;
}
