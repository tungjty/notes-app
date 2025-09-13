
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "Lax"; // Strict | Lax | None

  const res = NextResponse.json({ message: `Logged in with SameSite=${mode}` });

  res.cookies.set("session", "user-123", {
    httpOnly: true,
    secure: true,
    sameSite: mode as "strict" | "lax" | "none",
    // path: "/api",
    path: "/",
    maxAge: 60 * 60, // 1h
  });

  return res;
}
