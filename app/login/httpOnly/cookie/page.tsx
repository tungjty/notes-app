"use client";

// 🔑 Refresh Token Rotation là gì?
// Khi user login, server tạo ra refreshToken A và gửi về client (lưu trong cookie HttpOnly).
// Lần đầu access token hết hạn → client gửi refreshToken A lên để xin token mới.
// Server cấp accessToken mới + refreshToken B, đồng thời xoá/thu hồi refreshToken A.
// Lần sau client chỉ có thể dùng refreshToken B (A bị revoke rồi).
// Nếu hacker có được refreshToken A → không thể dùng được nữa (vì đã bị thay thế).

// 1. Khi login
// Tạo refreshToken → hash (dùng bcrypt) → lưu vào DB.
// Gửi refreshToken gốc về client (cookie HttpOnly).

// 2. Khi refresh
// Verify refreshToken hợp lệ về mặt chữ ký JWT.
// So sánh hash jti của refreshToken với DB. Nếu không match → reject.
// Nếu match → cấp refreshToken mới, hash và lưu vào DB (ghi đè).
// Gửi refreshToken mới cho client (cookie mới).

// 3. Khi logout
// clear cookies + xóa refresh token hash DB (set null) → đảm bảo không reuse lại được.

import { useState } from "react";
import { Input, Button, Card } from "@heroui/react";
import { fetchWithHttpOnlyAuth } from "@/lib/fetchWithHttpOnlyAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login/httpOnly/cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) setMessage(`Welcome ${data.user.name || data.user.email} 🎉`);
    else setMessage(data.error || "❌ Có lỗi xảy ra");
  };

  const handleFetchDocs = async () => {
    try {
      const res = await fetchWithHttpOnlyAuth("/api/docs/httpOnly/cookie");
      const data = await res.json();
      setMessage(JSON.stringify(data));
    } catch (err: unknown) {
       setMessage(err instanceof Error ? `❌ ${err.message}` : "❌ Unknown error");
    }
  };

  const handleLogout = async () => {
    // 👉 Xoá cookies bằng server (simple demo: overwrite với Max-Age=0)
    await fetch("/api/logout/httpOnly/cookie", { method: "POST" });
    setMessage("Bạn đã đăng xuất, hẹn gặp lại 🎉");
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

        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={handleLogout}
        >
          Logout (HttpOnly cookie)
        </Button>

        <Button className="mt-4" color="secondary" onPress={handleFetchDocs}>
          Fetch docs (HttpOnly cookie)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
