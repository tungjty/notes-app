import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserSession from "@/models/UserSession";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // ✅ Verify refresh token và lấy jti
    const payload = verifyRefreshToken(refreshToken);

    // ✅ Tìm session theo jti
    const sessions = await UserSession.find({ userId: payload.userId });
    let session = null;
    for (const s of sessions) {
      const isValid = await bcrypt.compare(payload.jti, s.jtiHash);
      if (isValid) {
        session = s;
        break;
      }
    }

    if (!session) {
      return NextResponse.json({ error: "No active session found" }, { status: 401 });
    }

    // ✅ Sinh access token & refresh token mới
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: "a@gmail.com",
    });
    const { token: newRefreshToken, jti: newJti } = signRefreshToken({
      userId: payload.userId,
    });

    // Cập nhật lại jtiHash của session hiện tại
    session.jtiHash = await bcrypt.hash(newJti, 10);
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    const res = NextResponse.json({ accessToken });
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 phút
    });
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (err) {
    console.error("Refresh session error:", err);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 401 }
    );
  }
}
