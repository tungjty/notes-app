// app/login/page.tsx
import LoginForm from "./LoginForm_#2";

interface LoginPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams; // 👈 await props
  const reason = typeof params?.reason === "string" ? params.reason : null;
  const callbackUrl =
    typeof params?.callbackUrl === "string" ? params.callbackUrl : "/dashboard";

  return <LoginForm reason={reason} callbackUrl={callbackUrl} />;
}
