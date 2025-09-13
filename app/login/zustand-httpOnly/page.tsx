"use client";

// Flow demo

// Login:
// Server tạo access token (ngắn hạn, ví dụ 15 phút) trả về client.
// Server tạo refresh token (dài hạn, 7 ngày), hash jti lưu DB, set trong HttpOnly cookie.
// Client nhận access token → lưu vào Zustand store (memory only).

// Fetch docs:
// Client lấy access token từ Zustand → gửi kèm Authorization: Bearer ....
// Server verify access token:
// Nếu valid → trả dữ liệu docs.
// Nếu expired/invalid → server trả 401 Unauthorized.
// Client bắt lỗi 401 → gọi refresh API:
// Refresh API đọc refresh token từ HttpOnly cookie.
// Nếu hợp lệ (bcrypt.compare jti hash đúng) → server cấp access token mới.
// Client update access token vào Zustand store → fetch lại docs.
// Nếu refresh cũng fail → logout.

import { useState } from "react";
import { Input, Button, Card } from "@heroui/react";
import { useAuthStore } from "@/store/auth";
import { handleApiError } from "@/lib/handleApiError";
import { authClient, AuthError, ServerError } from "@/lib/authClient";

export default function LoginPage() {
  const { accessToken, setAccessToken, clear } = useAuthStore();
  console.log("accessToken from Zustand store:", accessToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login/zustand-httpOnly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      setAccessToken(data.accessToken);
      setMessage(`Welcome ${data.user.name || data.user.email} 🎉`);
    } else setMessage(data.error || "❌ Có lỗi xảy ra");
  };

  const handleFetchDocs = async () => {
    try {
      const res = await authClient.fetchWithAuth(
        "/api/docs/zustand-httpOnly"
      );
      const data = await res.json();
      setMessage(data);
    } catch (error) {
      if (error instanceof AuthError) {
        clear(); // clear access token trong Zustand store
        setMessage("❌ Phiên đăng nhập đã hết hạn, vui lòng login lại");
      } else if (error instanceof ServerError) {
        setMessage(
          `❌ Server gặp sự cố (${error.status}), vui lòng thử lại sau`
        );
      } else {
        setMessage("❌ Failed to fetch docs");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout/zustand-httpOnly", {
        method: "POST",
      });
      if (!res.ok) throw new Error("❌ Log out bị lỗi, vui lòng thử lại nhé");

      clear(); // clear access token trong Zustand store
      setMessage("Bạn đã đăng xuất, hẹn gặp lại 🎉");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(handleApiError(error, "❌ Failed to log out"));
      } else {
        setMessage("❌ Failed to log out");
      }
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

        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={handleLogout}
        >
          Logout (HttpOnly + Zustand)
        </Button>

        <Button className="mt-4" color="secondary" onPress={handleFetchDocs}>
          Fetch docs (HttpOnly cookie)
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
