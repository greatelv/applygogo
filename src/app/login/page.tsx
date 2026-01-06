import { LoginPage } from "@/components/login-page";
import { login } from "@/app/actions";

export default function Page() {
  return <LoginPage action={login} />;
}
