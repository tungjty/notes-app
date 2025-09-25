import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // verify accessToken bằng jose (hỗ trợ Edge runtime)
import { AuthReason } from "./authReasons";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const encoder = new TextEncoder();

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      encoder.encode(ACCESS_TOKEN_SECRET)
    );
    return payload; // Trả payload nếu token hợp lệ
  } catch (err) {
    console.error("❌ [Auth] accessToken invalid/expired:", err);
    return null;
  }
}

export interface AuthResult {
  flags: {
    "x-redirect"?: "1";
    reason?: AuthReason;
  };
  response?: NextResponse;
}

export function redirectWithReason(
  req: NextRequest,
  loginPath: string,
  reason: AuthReason,
): NextResponse {
  const loginUrl = new URL(loginPath, req.url);
  // gắn search params
  loginUrl.searchParams.set("reason", reason);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

// Danh sách route cần bỏ qua
const skipRoutes = [
  "/api/login",
  "/api/logout",
  "/api/refresh",
  "/api/docs",
  // "/api/notes",
  "/api/register",
  "/api/forgot-password",
  "/api/auth/check-token",
];

// Helper function
function shouldSkip(pathname: string): boolean {
  return skipRoutes.some((route) => pathname.startsWith(route));
}

export async function handleAuth(req: NextRequest): Promise<AuthResult> {
  const result: AuthResult = { flags: {} };
  const { pathname } = req.nextUrl;
  console.log("Middleware chạy cho:", pathname);

  // ✅ Nếu pathname bắt đầu bằng bất kỳ route nào trong skipRoutes -> bỏ qua
  if (shouldSkip(pathname)) {
    console.log("✅ Skip route → cho đi tiếp");
    return result; // không set flag gì 👉 pass
  }

  // Lấy accessToken từ cookie
  const token = req.cookies.get("accessToken")?.value;

  // ❌ Chưa login
  if (!token) {
    console.warn(
      "⚠️ [Auth] Không tìm thấy accessToken trong cookie -> redirect"
    );
    result.flags = { "x-redirect": "1", reason: AuthReason.Unauthenticated };
    return result;
  }

  const payload = await verifyAccessToken(token);

  // ✅ token ok -> cho đi tiếp
  if (payload) {
    console.log("✅ Verify accessToken thành công -> đi tiếp ...");
    return result; // không set flag gì 👉 pass
  }

  // // Lấy refreshToken từ cookie
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!payload && !refreshToken) {
    console.warn(
      "⚠️ [Auth] accessToken hết hạn/không hợp lệ, không có refreshToken -> redirect..."
    );
    result.flags = { "x-redirect": "1", reason: AuthReason.SessionExpired };

    return result;
  }

  // 🔄 Nếu accessToken expired/invalid -> gọi refresh API
  try {
    console.warn(
      "⚠️ [Auth] accessToken hết hạn/không hợp lệ -> 🔄 gọi refresh API..."
    );

    const refreshRes = await fetch(
      new URL("/api/refresh/httpOnly/cookie", req.url),
      {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    // ❌ Nếu refresh fail -> redirect login
    if (!refreshRes.ok) {
      let errorMessage = "";
      const data = await refreshRes.json();
      errorMessage = data?.error || JSON.stringify(data);

      console.error("❌ [Auth] Refresh token failed:", errorMessage);

      result.flags = {"x-redirect": "1", reason: AuthReason.TokenRefreshFailed,};

      return result;
    }

    // 🚀 Refresh thành công -> forward lại Set-Cookie cho browser
    const res = NextResponse.next();
    const setCookies = refreshRes.headers.get("set-cookie");
    if (setCookies) res.headers.append("set-cookie", setCookies);

    console.log("✅ [Auth] Refresh thành công -> tiếp tục request");
    // result.flags["x-refresh"] = "1";
    result.flags.reason = AuthReason.TokenRefreshed;
    result.response = res; // 👈 forward response về middleware
    return result;
  } catch (err) {
    console.error("❌ [Auth] Lỗi server/network khi gọi handleAuth:", err);

    result.flags = {"x-redirect": "1", reason: AuthReason.AuthError,
    };
    return result;
  }
}
