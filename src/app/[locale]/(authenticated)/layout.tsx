import { auth } from "@/auth";
import { logOut } from "@/app/lib/actions";
import { ClientDashboardWrapper } from "@/app/components/client-dashboard-wrapper";
import { redirect } from "@/i18n/routing";
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan_type: true,
      plan_expires_at: true,
      credits: true,
    },
  });

  // Check if plan is expired
  const now = new Date();
  let currentPlanType = user?.plan_type || "FREE";
  let currentCredits = user?.credits ?? 0;

  if (
    user?.plan_expires_at &&
    user.plan_expires_at <= now &&
    user.plan_type !== "FREE"
  ) {
    // Plan expired, update to FREE
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan_type: "FREE",
        plan_expires_at: null,
      },
    });
    currentPlanType = "FREE";
  }

  return (
    <ClientDashboardWrapper
      user={session.user}
      logOutAction={logOut}
      initialPlan={currentPlanType}
      initialQuota={currentCredits}
    >
      {children}
    </ClientDashboardWrapper>
  );
}
