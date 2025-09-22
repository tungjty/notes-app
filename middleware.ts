// Cookie HttpOnly (sessionId) chỉ được gửi khi:
// +++ Access-Control-Allow-Credentials: true
// +++ Origin hợp lệ.

import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors/handleCors";
import { handleAuth, redirectWithReason } from "@/lib/auth/handleAuth";

export async function middleware(req: NextRequest) {
  console.log("👉 Bắt đầu middleware...");

  const origin = req.headers.get("origin");
  const isSameOrigin = !origin || origin === req.nextUrl.origin;

  // 🚀 Case 1: cross-origin → chỉ check CORS
  if (!isSameOrigin) {
    console.log("🌐 Cross-origin request → chạy CORS");

    const corsResult = handleCors(req);

    if (corsResult?.flags["x-preflight"]) {
      console.log("✅ Preflight request");
      return new NextResponse(null, {
        status: 200,
        headers: corsResult.headers,
      });
    }

    if (corsResult?.flags["x-blocked"]) {
      console.log("🚫 Origin không hợp lệ → block");
      return new NextResponse("403 Forbidden - Origin is not allowed by CORS", {
        status: 403,
        // headers: corsResult.headers,
      });
    }

    if (corsResult?.flags["x-method-not-allowed"]) {
      console.log(`🚫 Method ${req.method} không hợp lệ → block`);
      return new NextResponse(
        `405 Method Not Allowed - Method ${req.method} is not allowed by CORS`,
        {
          status: 405,
          // headers: corsResult,
        }
      );
    }

    console.log("✅ CORS passed → cho đi tiếp");
    return NextResponse.next({ headers: corsResult?.headers || {} });
  }

  // 🚦 CASE 2: Same-origin → check Auth
  console.log("🔒 Same-origin request → chạy Auth");
  const authResult = await handleAuth(req);
  if (authResult.flags["x-redirect"]) {
    console.log(
      `🙁 [ Middleware ] redirect → /login (reason: ${authResult.flags.reason})`
    );
    return redirectWithReason(req, "/login/httpOnly/cookie", authResult.flags.reason!);
  }

  if (authResult.response) {
    console.log(
      `🍪 [ Middleware ] Forward response từ handleAuth (reason: ${authResult.flags.reason})`
    );
    return authResult.response;
  }

  // handleAuth() 👉 result không set flag gì = pass
  console.log("✅ Auth passed → cho đi tiếp");
  // Next.js luôn resolve Promise<null | undefined> thành NextResponse.next()
  // cho nên đoạn code ở dưới là không cần thiết👇
  return NextResponse.next();
}

// Áp dụng middleware cho tất cả route trong /api/*
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/"],
};
