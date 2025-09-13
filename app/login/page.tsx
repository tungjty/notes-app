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

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`Welcome ${data.user.name || data.user.email} 🎉`);

      // 👉 lưu tokens vào localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // (tuỳ chọn) lưu sơ info user để hiển thị UI
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

    } else {
      setMessage(data.error || "❌ Có lỗi xảy ra");
    }
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

        {/* (tuỳ chọn) nút logout để test nhanh */}
        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setMessage("Đã xoá data khỏi localStorage");
          }}
        >
          Clear tokens (test)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
