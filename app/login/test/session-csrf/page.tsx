// Ý tưởng

// Login / Start session → server tạo:
// + Session-based auth:
// Client giữ cookie HttpOnly chứa sessionId (random string).
// Server lưu hash(sessionId) + CSRF token.
// CSRF token trả về client (qua API /csrf).

// + JWT-based auth:
// Nếu lưu JWT trong HttpOnly cookie → vẫn cần CSRF token để chống CSRF.
// Nếu lưu JWT trong Authorization: Bearer <jwt> header → ít khi cần CSRF token, vì attacker không thể chèn thêm header qua CSRF.

// Nếu cookie-based (sessionId hoặc JWT trong cookie): nên dùng CSRF token.

// Nếu header-based (JWT trong Authorization): CSRF token ít cần thiết, chỉ cần chống XSS.

// Frontend:

// Không thể đọc cookie HttpOnly (an toàn).
// Nhưng có API /api/csrf để lấy csrfToken (server chỉ trả token, không lộ sessionId).
// Request POST/PUT/DELETE:
// Trình duyệt tự gửi sessionId trong cookie.
// Frontend gửi kèm csrfToken (header/body).

// Server:

// Kiểm tra cookie sessionId hợp lệ.
// Kiểm tra csrfToken từ request có khớp với session không.
// Nếu ok → xử lý.

// ✅ attacker không đọc được sessionId (cookie HttpOnly) cũng không đoán được CSRF Token → chống CSRF hiệu quả.

"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Helper: lấy token từ response header
  const extractToken = (res: Response) => {
    const tokenFromHeader = res.headers.get("x-csrf-token");
    if (tokenFromHeader) setCsrfToken(tokenFromHeader);
    console.log("csrfToken mới server gửi về ở header =", tokenFromHeader);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login/session-csrf", {
      method: "POST",
    });
    const data = await res.json();

    if (res.ok) {
      setMessage(`${data.message} 🎉`);
      setCsrfToken(data.csrfToken);
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/logout/session-csrf", { method: "POST" });
    setCsrfToken(null);
    if (res.ok) {
      const data = await res.json();
      setMessage(`${data.message} ✅`);
    } else setMessage("❌ Đăng xuất thất bại!");
  };

  // Transfer với auto-fallback khi 403
  const handleTransfer = async () => {
    console.log("csrfToken client gửi trong transfer =", csrfToken);

    const res = await fetch("/api/csrf/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken || "",
      },
      body: JSON.stringify({ amount: 500, to: "Alice" }),
    });

    const data = await res.json();
    if (res.ok) {
      extractToken(res);
      setMessage(`${data.message} 🎉`);
    } else if (res.status === 403) {
      // Fallback: lấy token mới từ /api/csrf
      const retryRes = await fetch("/api/csrf");
      extractToken(retryRes);
      const retryData = await retryRes.json();
      setCsrfToken(retryData.csrfToken);
      setMessage("⚠️ Token hết hạn, đã làm mới. Vui lòng thử lại.");
    } else setMessage(`❌ ${data.error}`);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Button type="submit" color="primary">
            Đăng nhập
          </Button>
        </form>

        <Button className="mt-4" color="secondary" onPress={handleTransfer}>
          Chuyển tiền (500k)
        </Button>
        <Button
          className="mt-4"
          variant="flat"
          color="danger"
          onPress={handleLogout}
        >
          Đăng xuất
        </Button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
