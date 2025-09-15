// Với request CORS preflight (OPTIONS), middleware sẽ trả về header CORS luôn.

// Cookie HttpOnly (sessionId) chỉ được gửi khi:
// +++ Access-Control-Allow-Credentials: true
// +++ Origin hợp lệ.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jsonAllowed from "@/lib/allowed-origins.json"; // ✅ Edge runtime cho phép

// ✅ Helper: lấy ra các domains có thể gọi API
function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS)
    return process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

  return jsonAllowed.origins;
}

export function middleware(req: NextRequest) {
  // Origin là header browser tự thêm khi có cross-origin request.
  const origin = req.headers.get("origin") || "";
  // same-site (origin === null/undefined) hoặc direct call
  const isSameOrigin = !origin || origin === req.nextUrl.origin;
  const method = req.method;
  const url = new URL(req.url);
  const ALLOWED_ORIGINS = getAllowedOrigins();

  // /api/public/* → cho phép mọi origin (*) nhưng no credentials.
  if (url.pathname.startsWith("/api/public")) {
    console.log("Gọi Public API -> cho phép đi tiếp ...");

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Credentials", "false"); // no credentials includes 👈
    res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
  }

  // /api/private/* → chỉ cho http://localhost:3000 + cho credentials.
  if (url.pathname.startsWith("/api/private")) {
    console.log("Gọi Private API -> chỉ cho phép localhost:3000 ...");

    const privateOrigins = [
      "https://notes-app-tan-sigma-44.vercel.app",
      "http://localhost:3000",
    ];
    if (origin && !privateOrigins.includes(origin))
      // ❌ Origin không phải nội bộ → block request
      return new NextResponse("403 Forbidden - private route", { status: 403 });

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true"); // no credentials includes 👈
    res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
  }

  // 👉 Cho phép same-origin hoặc cross-origin phải match ALLOWED_ORIGINS.
  if (isSameOrigin || ALLOWED_ORIGINS.includes(origin)) {
    const allowedMethods = ["GET", "OPTIONS"];

    // cùng domain → OK ✅, khác domain thì POST PUT DELETE → 403
    if (!isSameOrigin && !allowedMethods.includes(method)) {
      return new NextResponse(
        `403 Forbidden! Method ${method} is not allowed by CORS`,
        { status: 403 }
      );
    }

    const res = NextResponse.next();

    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true"); // credentials includes 👈
    res.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    );
    // 👇 Cho phép client đọc lại các header này
    res.headers.set(
      "Access-Control-Expose-Headers",
      "Access-Control-Allow-Origin, Access-Control-Allow-Credentials"
    );
    res.headers.set("Vary", "Origin"); // 👈 safe for cache

    // Nếu là preflight (OPTIONS) thì return luôn
    if (req.method === "OPTIONS") {
      console.log("🔎 Preflight OPTIONS received from:", origin);
      // Next.js (App Router + Route Handler) xử lý OPTIONS mặc định
      // Khi bạn dùng route handlers (app/api/.../route.ts), Next.js sẽ tự động handle OPTIONS cho bạn nếu bạn không override.
      // Nó sẽ trả về 204 No Content mặc định, kèm header Access-Control-Allow-Origin

      // 👇 Cho nên không cần đoạn code này 👇
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
  matcher: ["/api/:path*"],
};
