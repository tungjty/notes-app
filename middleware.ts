// Với request CORS preflight (OPTIONS), middleware sẽ trả về header CORS luôn.

// Cookie HttpOnly (sessionId) chỉ được gửi khi:
// +++ Access-Control-Allow-Credentials: true
// +++ Origin hợp lệ.

import { NextRequest, NextResponse } from "next/server";
import jsonAllowed from "@/lib/allowed-origins.json"; // ✅ Edge runtime cho phép
import rulesConfig from "@/lib/cors-rules.json";

// ✅ Helper: lấy ra các domains có thể gọi API
function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS)
    return process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

  return jsonAllowed.origins;
}

// Helper: tìm rule theo pathname
function findCorsRule(pathname: string) {
  return rulesConfig.rules.find((rule) => pathname.startsWith(rule.path));
}

export function middleware(req: NextRequest) {
  // Origin là header browser tự thêm khi có cross-origin request.
  // same-site & GET : origin === null) -> lấy origin của API url
  const origin = req.headers.get("origin") ?? req.nextUrl.origin;
  console.log(`origin :`, req.headers.get("origin"));
  console.log(`NextUrl :`, req.nextUrl);
  const isSameOrigin = !origin || origin === req.nextUrl.origin;
  console.log(`isSameOrigin :`, isSameOrigin);
  const { pathname } = req.nextUrl;
  const rule = findCorsRule(pathname);
  const ALLOWED_ORIGINS = getAllowedOrigins();

  // Nếu có rule (ex, `/api/public`, `/api/private` ...)
  if (rule) {
    if (process.env.NODE_ENV !== "production")
      console.log(
        `🔧 CORS matched rule for ${pathname}, 
        origin=${origin}, 
        methods=${rule.methods.join(",")}`
      );

    // Check origin có nằm trong allowed origins?
    const isAllowed =
      rule.origins.includes("*") || rule.origins.includes(origin);

    if (!isAllowed) {
      return new NextResponse("403 Forbidden - Origin is not allowed by CORS", {
        status: 403,
      });
    }

    // Nếu method không được phép
    if (!rule.methods.includes(req.method)) {
      return new NextResponse(
        "405 Method Not Allowed - Method ${method} is not allowed by CORS",
        {
          status: 405,
        }
      );
    }

    //  ✅ Hợp lệ → cho đi tiếp + set header
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", rule.methods.join(","));
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Vary", "Origin"); // 👈 safe for cache

    return res;
  }

  // Chưa có rule nào ( ex, `/api/test`, `/api/logout`...) 👇
  if (process.env.NODE_ENV !== "production")
      console.log(`Chưa có rule nào được set với pathname: `, pathname);

  // ❌ Origin không hợp lệ → block request
  if (!isSameOrigin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(
      "403 Forbidden! Please check CORS strict in middleware for this origin",
      { status: 403 }
    );
  }

  // 👇 Cho phép same-origin hoặc cross-origin phải match ALLOWED_ORIGINS.
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true"); // credentials includes 👈
  // res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
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
    // trả về 204 No Content mặc định, kèm header Access-Control-Allow-Origin
    // 👇 Cho nên không cần đoạn code này 👇
    return new NextResponse(null, { headers: res.headers });
  }

  return res;
}

// Áp dụng middleware cho tất cả route trong /api/*
export const config = {
  matcher: ["/api/:path*"],
};
