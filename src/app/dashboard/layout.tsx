import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./dashboard-shell";
import { getUserSubscription } from "@/lib/subscription";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const subscription = await getUserSubscription(session.user.id);

  return (
    <DashboardShell
      user={{
        name: session.user.name || "사용자",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }}
      plan={subscription.plan as "FREE" | "STANDARD" | "PRO"}
      quota={subscription.quota}
    >
      {children}
    </DashboardShell>
  );
}
