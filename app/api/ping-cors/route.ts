import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Đọc cookie "session" từ request
  const sessionCookie = req.cookies.get("session")?.value || "no-session";

  return NextResponse.json({
    message: "pong ✅",
    cookie: sessionCookie,
  });
}

export async function POST(req: NextRequest) {
  // Ví dụ: đọc body JSON client gửi
  const body = await req.json().catch(() => ({}));

  // Đọc cookie "session"
  const sessionCookie = req.cookies.get("session")?.value || "no-session";

  return NextResponse.json({
    message: "pong POST ✅",
    cookie: sessionCookie,
    body,
  });
}
