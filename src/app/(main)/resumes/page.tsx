import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/subscription";
import { getUserResumes } from "@/lib/resume";
import { ResumesClientPage } from "./resumes-client";

export default async function ResumesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [subscription, resumes] = await Promise.all([
    getUserSubscription(session.user.id),
    getUserResumes(session.user.id),
  ]);

  return <ResumesClientPage resumes={resumes} quota={subscription.quota} />;
}
