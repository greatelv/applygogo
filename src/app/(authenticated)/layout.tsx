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
    select: {
      planType: true,
      planExpiresAt: true,
      credits: true,
    },
  });

  // Check if plan is expired
  const now = new Date();
  let currentPlanType = user?.planType || "FREE";
  let currentCredits = user?.credits || 10;

  if (
    user?.planExpiresAt &&
    user.planExpiresAt <= now &&
    user.planType !== "FREE"
  ) {
    // Plan expired, update to FREE
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        planType: "FREE",
        planExpiresAt: null,
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
