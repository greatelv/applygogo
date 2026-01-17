import { auth } from "@/auth";
import { logOut } from "@/app/lib/actions";
import { ClientServiceWrapper } from "@/app/components/client-service-wrapper";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface SharedServiceLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export async function SharedServiceLayout({
  children,
  locale = "ko",
}: SharedServiceLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
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
    <ClientServiceWrapper
      user={session.user}
      logOutAction={logOut}
      initialPlan={currentPlanType}
      initialQuota={currentCredits}
      locale={locale}
    >
      {children}
    </ClientServiceWrapper>
  );
}
