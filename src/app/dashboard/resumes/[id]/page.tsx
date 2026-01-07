import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ResumeEditor } from "@/components/resume-editor";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResumeDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      workExperiences: {
        orderBy: { order: "asc" },
      },
      educations: {
        orderBy: { order: "asc" },
      },
      skills: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!resume) {
    notFound();
  }

  if (resume.userId !== session.user.id) {
    // Basic authorization check
    // In a real app, you might want to show a 403 error page
    notFound();
  }

  // Cast JSON types to what the component expects if necessary
  // Prisma types for Json fields are usually InputJsonValue | null...
  // The component expects string[] for bullets, which we ensured in the DB save.
  // We might need to cast or validate in the editor component, but passing as is usually works if data is correct.

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <ResumeEditor initialData={resume as any} />
    </div>
  );
}
