import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ResumesClient } from "./resumes-client";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updated_at: "desc" },
  });

  // Fetch full user details to check plan
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planType: true },
  });

  const showBetaBanner = user?.planType === "PASS_BETA_3DAY";

  const mappedResumes = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status as
      | "IDLE"
      | "SUMMARIZED"
      | "TRANSLATED"
      | "COMPLETED"
      | "FAILED",
    currentStep: r.current_step as
      | "UPLOAD"
      | "PROCESSING"
      | "EDIT"
      | "TEMPLATE"
      | "COMPLETED",
    updatedAt: r.updated_at.toISOString().split("T")[0],
  }));

  // Placeholder for quota
  const quota = 10;

  return (
    <ResumesClient
      resumes={mappedResumes}
      quota={quota}
      showBetaBanner={showBetaBanner}
    />
  );
}
