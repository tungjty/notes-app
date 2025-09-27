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

import { Input, Button, Card } from "@heroui/react";
import { fetchWithHttpOnlyAuth } from "@/lib/fetchWithHttpOnlyAuth";
import { useAuthMessage } from "@/lib/hooks/useAuthMessage";
import { loginAction } from "./loginAction";
import { useSessionCheck } from "@/lib/hooks/useSessionCheck";
import { AuthReason } from "@/lib/auth/authReasons";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  reason: string | null;
  callbackUrl: string;
  hasSession: boolean; // 👉 truyền từ page xuống
};

export default function LoginForm({ reason, callbackUrl, hasSession }: LoginFormProps) {
  const router = useRouter();

  // ✅ khởi tạo state từ hook
  const { message, setMessage } = useAuthMessage(reason);

  const handleLogout = async () => {
    try {
      // 👉 Xoá cookies bằng server (simple demo: overwrite với Max-Age=0)
      const res = await fetch("/api/logout/httpOnly/cookie", { method: "POST" });

      if (res.ok) {
        router.push(`/login/httpOnly/cookie?reason=${AuthReason.LogoutSucces}`);
      } else {
        setMessage("Có lỗi xảy ra khi logout, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      setMessage("Có lỗi xảy ra khi logout, vui lòng thử lại.");
    }
  };

  const handleFetchDocs = async () => {
    try {
      const res = await fetchWithHttpOnlyAuth("/api/docs/httpOnly/cookie");
      const data = await res.json();
      setMessage(JSON.stringify(data));
    } catch (err: unknown) {
      setMessage(err instanceof Error ? `${err.message}` : "Unknown error");
    }
  };

  // const { loading, code } = useSessionCheck();
  // if (loading) return <p>⏳ Đang kiểm tra session...</p>;
  // if (code === AuthReason.AuthSuccess) {

  if (hasSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-6 w-96">
          <p className="mb-8 text-center text-green-200">
            Bạn đã đăng nhập rồi. Bạn muốn đăng nhập tài khoản khác?
          </p>
          <Button
            className="w-full"
            variant="flat"
            color="warning"
            onPress={handleLogout}
          >
            → Logout trước nhé
          </Button>
          
          {message && <p className="mt-4 text-center">{message}</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login - a@gmail.com</h2>
        {/* <form onSubmit={handleLogin} className="flex flex-col gap-4"> */}
        <form
          action={async (formData) => {
            const res = await loginAction(formData, callbackUrl);
            if (res?.error) setMessage(res.error);
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Email"
            name="email"
            type="email"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
          />
          <Button type="submit" color="primary">
            Đăng nhập
          </Button>
        </form>

        <Button
          className="mt-4"
          variant="flat"
          color="warning"
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
