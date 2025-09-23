"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Vì login page dùng useSearchParams() -> Next.js bắt phải wrap trong Suspense boundary */}
      <LoginForm />
    </Suspense>
  );
}
