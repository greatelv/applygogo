import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUserGlobalResumes(locale: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const resumes = await prisma.globalResume.findMany({
    where: {
      userId: session.user.id,
      sourceLocale: locale, // 해당 언어의 이력서만 필터링
    },
    orderBy: { created_at: "desc" },
  });

  return resumes.map((r) => {
    // DB의 'EDIT_TRANSLATION' 단계를 UI의 'EDIT' 단계로 매핑
    let currentStep:
      | "UPLOAD"
      | "PROCESSING"
      | "EDIT"
      | "TEMPLATE"
      | "COMPLETED" = "UPLOAD";

    if (r.current_step === "EDIT_TRANSLATION") {
      currentStep = "EDIT";
    } else {
      currentStep = r.current_step as any;
    }

    return {
      id: r.id,
      title: r.name_original || "Untitled Resume",
      status: (r.status || "IDLE") as
        | "IDLE"
        | "SUMMARIZED"
        | "TRANSLATED"
        | "COMPLETED"
        | "FAILED",
      currentStep,
      updatedAt: r.updated_at.toISOString().split("T")[0],
    };
  });
}

export async function getUserGlobalResume(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const r = await prisma.globalResume.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      additionalItems: { orderBy: { order: "asc" } },
    },
  });

  if (!r) return null;

  // DB의 'EDIT_TRANSLATION' 단계를 UI의 'EDIT' 단계로 매핑
  let currentStep: "UPLOAD" | "PROCESSING" | "EDIT" | "TEMPLATE" | "COMPLETED" =
    "UPLOAD";
  if (r.current_step === "EDIT_TRANSLATION") {
    currentStep = "EDIT";
  } else {
    currentStep = r.current_step as any;
  }

  return {
    ...r,
    currentStep,
    // Add other mapped fields if necessary for ease of use in UI
  };
}
