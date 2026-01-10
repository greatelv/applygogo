import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { SettingsClientPage } from "./client-page";
import { getUserSettings } from "../../lib/actions";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userSettings = await getUserSettings();

  return (
    <SettingsClientPage
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      settings={userSettings}
    />
  );
}
