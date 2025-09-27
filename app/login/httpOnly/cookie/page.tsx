// app/login/page.tsx
import LoginForm from "./LoginForm";
import { cookies } from "next/headers";
import { validateToken } from "@/lib/auth/validateToken";
import { AuthReason } from "@/lib/auth/authReasons";

interface LoginPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams; // 👈 await props
  const reason = typeof params?.reason === "string" ? params.reason : null;
  const callbackUrl =
    typeof params?.callbackUrl === "string" ? params.callbackUrl : "/dashboard";

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const result = validateToken(accessToken, refreshToken);
  const hasSession = result.ok && result.code === AuthReason.AuthSuccess;

  return <LoginForm reason={reason} callbackUrl={callbackUrl} hasSession={hasSession} />;
}
