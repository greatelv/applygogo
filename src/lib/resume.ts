import { prisma } from "@/lib/prisma";

export async function getUserResumes(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return resumes.map((resume: any) => ({
    ...resume,
    updatedAt: resume.updatedAt.toISOString(),
  }));
}
