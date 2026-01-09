import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { SettingsClientPage } from "./client-page";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <SettingsClientPage user={session.user} />;
}
