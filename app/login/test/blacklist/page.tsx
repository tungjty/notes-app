"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { fetchWithHttpOnlyAuth } from "@/lib/fetchWithHttpOnlyAuth";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/test/blacklist/login", {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok)
      setMessage(`Welcome (fake) ${data.user.name || data.user.email} 🎉`);
  };

  const handleFetchDocs = async () => {
    try {
      const res = await fetchWithHttpOnlyAuth(
        "/api/docs/httpOnly/cookie",
        "/api/test/blacklist/refresh"
      );
      const data = await res.json();
      setMessage(JSON.stringify(data));
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? `❌ ${err.message}` : "❌ Unknown error"
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Button type="submit" color="primary">
            Đăng nhập (fake)
          </Button>
        </form>

        <Button className="mt-4" color="secondary" onPress={handleFetchDocs}>
          Fetch docs (cookie + blacklist)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
