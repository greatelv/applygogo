import { auth } from "../../auth";
import { logOut } from "../lib/actions";
import { ClientDashboardWrapper } from "../components/client-dashboard-wrapper";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ClientDashboardWrapper user={session.user} logOutAction={logOut}>
      {children}
    </ClientDashboardWrapper>
  );
}
