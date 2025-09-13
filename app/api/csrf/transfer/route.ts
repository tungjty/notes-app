// API /api/transfer với:

// Xác thực CSRF token theo atomic findOneAndUpdate (match sessionId + csrfToken).
// Khi hợp lệ → tạo token mới → update DB → trả về trong response header x-csrf-token.
// Khi token sai (403) → client có thể gọi /api/csrf để fallback lấy token mới.

// Client-side:

// Nhận token mới từ response header.
// Nếu 403 → tự động gọi /api/csrf để refresh token.
// Lưu CSRF token trong state (in memory).

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import SessionCSRF from "@/models/SessionCSRF";
import crypto from "crypto";

//
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  await connectDB();

  // 👇 (optional) giả lập delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookieStore = cookies();
  const sessionId = (await cookieStore).get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session cookie" }, { status: 401 });
  }

  const body = await req.json();
  const clientToken = req.headers.get("x-csrf-token") || body.csrfToken;
  // const clientToken = "44d8b2976d13f4bcfe38aa09ce5c70d7a37f935b956b130bec43e84f77a8bad0";

  if (!clientToken) {
    return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
  }

  const session = await SessionCSRF.findOne({ sessionId });
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Tạo token mới trước để update
  const newToken = generateToken();

  // Atomic update: chỉ update nếu match sessionId + csrfToken
  const updated = await SessionCSRF.findOneAndUpdate(
    { sessionId, csrfToken: clientToken },
    { csrfToken: newToken, updatedAt: new Date() },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  // if (clientToken !== session.csrfToken) {
  //   return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  // }

  // TODO: business logic ở đây, ví dụ: chuyển tiền, update DB...

  // Response kèm token mới trong Header
  const res = NextResponse.json({
    success: true,
    message: `Chuyển ${body.amount} cho ${body.to} thành công`,
  });
  res.headers.set("x-csrf-token", newToken);

  return res;
}
