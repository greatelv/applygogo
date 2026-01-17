import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";
import { SettingsClientPage } from "./client-page";
import { getUserSettings } from "@/app/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user) {
    redirect({ href: "/login", locale });
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
      portoneConfig={{
        storeId:
          process.env.NEXT_PUBLIC_PORTONE_STORE_ID ||
          process.env.PORTONE_STORE_ID ||
          "",
        channelKey:
          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ||
          process.env.PORTONE_CHANNEL_KEY ||
          "",
      }}
    />
  );
}
