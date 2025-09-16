import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import crypto from "crypto";
import SessionCSRF from "@/models/SessionCSRF";

export async function POST() {
  try {
    await connectDB();

    const userId = "68ba8747c9a616d26a7e1a66"; // userId of `a@gmail.com` in Mongodb

    // Tạo sessionId + csrfToken
    const sessionId = crypto.randomBytes(16).toString("hex");
    const csrfToken = crypto.randomBytes(32).toString("hex");

    // (Demo) giả sử login user đầu tiên
    // Lưu session vào MongoDB
    await SessionCSRF.create({
      userId: userId,
      sessionId,
      csrfToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      // expiresAt: new Date(Date.now() + 30 * 1000) // 30s (test)
    });

    // 👉 Set cookie
    const res = NextResponse.json({ message: "Login thành công", csrfToken });
    res.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
      // maxAge: 30, // 30s
    });

    return res;
  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
