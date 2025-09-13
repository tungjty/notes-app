// Giải thích nhanh

// ALLOWED_ORIGINS → chỉ liệt kê domain frontend thật sự.
// Với request CORS preflight (OPTIONS), middleware sẽ trả về header CORS luôn.
// Nếu origin không nằm trong whitelist → trả về 403 Forbidden.
// Cookie HttpOnly (sessionId) chỉ được gửi khi:
// +++ Access-Control-Allow-Credentials: true
// +++ Origin hợp lệ.

// Test flow

// Gọi API từ http://localhost:3000 → pass.
// Gọi API từ https://evil.com → bị chặn (403 hoặc browser block).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ chỉ cho phép domain này gọi API
const ALLOWED_ORIGINS = [
  "https://myapp.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://notes-app-tan-sigma-44.vercel.app/"
];

export function middleware(req: NextRequest) {
  // Origin là header browser tự thêm khi có cross-origin request.
  const origin = req.headers.get("origin") || "";

  // 👉 Cho phép same-origin (origin === null/undefined) hoặc trong whitelist
  // Nếu request đến từ cùng domain (same-origin) → origin thường không có → mình cho pass luôn.
  // Nếu là cross-origin → phải match ALLOWED_ORIGINS.
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    const res = NextResponse.next();

    // Access-Control-Allow-Origin: http://127.0.0.1:4000
    // Cho phép origin cụ thể này được truy cập response. Nếu khác origin → browser block.
    res.headers.set("Access-Control-Allow-Origin", origin);
    // Cho phép gửi cookie/Authorization header đi kèm request.
    res.headers.set("Access-Control-Allow-Credentials", "true");
    // Chỉ định các HTTP methods nào được phép
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    // Cho phép client gửi thêm custom header (VD: X-CSRF-Token).
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    );
    // 👇 Cho phép client đọc lại các header này
    res.headers.set(
      "Access-Control-Expose-Headers",
      "Access-Control-Allow-Origin, Access-Control-Allow-Credentials"
    );

    // Nếu là preflight (OPTIONS) thì return luôn
    if (req.method === "OPTIONS") {
      // 🟢 Log preflight request
      console.log("🔎 Preflight OPTIONS received from:", origin);
      return new NextResponse(null, { headers: res.headers });
    }

    return res;
  }

  // ❌ Origin không hợp lệ → block request
  return new NextResponse(
    "403 Forbidden! Please check CORS strict in middleware for this origin",
    { status: 403 }
  );
}

// Áp dụng middleware cho tất cả route trong /api/*
export const config = {
  matcher: "/api/:path*",
};
