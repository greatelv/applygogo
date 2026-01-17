import { auth } from "@/auth";
import { logOut } from "@/app/lib/actions";
import { ClientDashboardWrapper } from "@/app/components/client-dashboard-wrapper";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface SharedDashboardLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export async function SharedDashboardLayout({
  children,
  locale = "ko",
}: SharedDashboardLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    if (locale === "ko") {
      redirect("/login");
    } else {
      redirect(`/${locale}/login`);
    }
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
  let currentCredits = user?.credits ?? 0;

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
      locale={locale === "ko" ? undefined : locale}
    >
      {children}
    </ClientDashboardWrapper>
  );
}
