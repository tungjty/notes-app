"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";

export default function LoginPage() {
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login/session", {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) setMessage(`${data.message} 🎉`);
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/refresh/session", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error}`);
        return;
      }

      setMessage(`✅ New access token: ${data.accessToken}`);
    } catch (err: unknown) {
      setMessage("❌ Fetch API endpoint error");
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("❌ Fetch (api/refresh/session) error:", message);
    }
  };

  async function handleLogout(all = false) {
    try {
      const res = await fetch("/api/logout/session", {
        method: "POST",
        credentials: "include", // gửi cookie kèm request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error || "Logout thất bại"}`);
        return;
      }

      setMessage(`⭐ ${data.message}`);
    } catch (err) {
      setMessage(`❌ Lỗi mạng: ${(err as Error).message}`);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Button type="submit" color="primary">
            Đăng nhập
          </Button>
        </form>

        <Button className="mt-4" color="secondary" onPress={handleRefresh}>
          Refresh Access Token
        </Button>

        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={() => handleLogout(false)}
        >
          Logout (thiết bị hiện tại)
        </Button>

        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={() => handleLogout(true)}
        >
          Logout (tất cả thiết bị)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
