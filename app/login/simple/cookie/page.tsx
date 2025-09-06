"use client";

import { useState } from "react";
import { Input, Button, Card } from "@heroui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login/simple/cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`Welcome ${data.user.name || data.user.email} 🎉`);

      // 👉 Set cookie (cookie thường, client đọc được)
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      document.cookie = `refreshToken=${data.refreshToken}; path=/`;
    } else {
      setMessage(data.error || "❌ Có lỗi xảy ra");
    }
  };

  const handleFetchDocs = async () => {
    try {
      const res = await fetch("/api/docs/simple/cookie");
      const data = await res.json();

      if (!res.ok) {
        // 👇 res.status 401/403 → có data.error
        setMessage(`❌ Error: ${data.error}`);
        return;
      }

      // ✅ Token hợp lệ → show docs
      setMessage(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setMessage("❌ Fetch API endpoint error");
      const message = err instanceof Error ? err.message : "Unknown error";
      console.log("❌ Fetch (api/docs/simple/cookie) error:", message);
    }
  };

  const handleClear = () => {
    // 👉 Clear cookie: set expired
    document.cookie = "accessToken=; Max-Age=0; path=/";
    document.cookie = "refreshToken=; Max-Age=0; path=/";
    setMessage("Đã xoá tokens khỏi cookie");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login - a@gmail.com</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" color="primary">
            Đăng nhập
          </Button>
        </form>

        {/* Clear cookie */}
        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={handleClear}
        >
          Clear cookie (Simple cookie)
        </Button>

        <Button className="mt-4" color="secondary" onPress={handleFetchDocs}>
          Fetch docs (simple cookie)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}