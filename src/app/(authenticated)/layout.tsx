import { auth } from "@/auth";
import { logOut } from "@/app/lib/actions";
import { ClientDashboardWrapper } from "@/app/components/client-dashboard-wrapper";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      usage_logs: true,
    },
  });

  const plan =
    user?.subscription?.status === "ACTIVE"
      ? (user.subscription.planCode as "FREE" | "STANDARD" | "PRO")
      : "FREE";

  // Calculate quota
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const usageCount =
    user?.usage_logs.filter((log) => log.created_at >= currentMonthStart)
      .length || 0;

  const planQuota = user?.subscription?.plan?.monthly_quota || 3; // Default FREE quota is 3
  const remainingQuota = Math.max(0, planQuota - usageCount);

  return (
    <ClientDashboardWrapper
      user={session.user}
      logOutAction={logOut}
      initialPlan={plan}
      initialQuota={remainingQuota}
    >
      {children}
    </ClientDashboardWrapper>
  );
}
