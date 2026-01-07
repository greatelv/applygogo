import { ProfilePage } from "../../components/profile-page";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ProfilePage
      userName={session.user.name || "사용자"}
      userEmail={session.user.email || ""}
      userImage={session.user.image || undefined}
      plan="FREE" // This should ideally come from the database/session
      createdAt={session.user.id ? undefined : "2024-01-01"} // Optional createdAt
    />
  );
}
