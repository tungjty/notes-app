import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import UserSession from "@/models/UserSession";

export async function POST(req: Request) {
  try {
    await connectDB();

    const email = "a@gmail.com"; // fake user
    const userId = "user-123"; // fake id

    // 👉 Sinh tokens
    const accessToken = signAccessToken({ userId, email });
    const { token: refreshToken, jti } = signRefreshToken({ userId });

    // 👉 Hash jti và lưu session
    const jtiHash = await bcrypt.hash(jti, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    await UserSession.create({
      userId,
      jtiHash,
      userAgent: req.headers.get("user-agent") || "unknown",
      ip: req.headers.get("x-forwarded-for") || "unknown",
      expiresAt,
    });

    // 👉 Set cookie
    const res = NextResponse.json({ message: "Login thành công" });
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15, // 15 phút
    });
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
