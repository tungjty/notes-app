import { handleApiError } from "@/lib/handleApiError";
import { verifyAccessToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 👇 Lấy header Cookie
  // Chuyển cookie string → object { key: value }
  const cookieHeader = req.headers.get("cookie") || "";
  // console.log("🍪 Raw Cookie Header:", cookieHeader);

  // Parse cookie thành object { key: value }
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );
  // console.log("🔎 Parsed Cookies:", cookies);

  // 👉 Lấy token từ cookie
  const token = cookies.accessToken;

  if (!token) {
    return NextResponse.json(
      { error: "No access token" },
      { status: 401 }
    );
  }

  try {
    const payload = verifyAccessToken(token);
    
    return NextResponse.json([
      { id: 1, title: "HttpOnly Doc A" },
      { id: 2, title: "HttpOnly Doc B" },
      { message: `Hello ${payload.email}` },
    ]);
  } catch (error) {
      handleApiError(error, "❌ Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
}
