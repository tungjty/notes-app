import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { users, tokenBlacklists, cleanupBlacklist } from "@/lib/db_mock";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  console.log("➡️ FAKE DB users:", users);

  try {
    // Decode + check blacklist
    const payload = verifyRefreshToken(refreshToken);
    const { userId, jti: payloadJti } = payload;
    console.log("🔑 Payload from refresh token:", payload);

    const user = users.get(userId);
    console.log("👤 User from DB:", user);
    
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 👇 Check old jti có trong blacklist chưa
    if (tokenBlacklists.has(payloadJti)) {
      console.log("🚫 Refresh token bị blacklist:", payloadJti);
      return NextResponse.json(
        { error: "Refresh token đã bị thu hồi" },
        { status: 403 }
      );
    }

    // 👇 Compare refreshToken với hash hiện tại trong user
    const isValid = await bcrypt.compare(
      payloadJti,
      user.currentRefreshTokenJtiHash || ""
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Refresh token không hợp lệ" },
        { status: 403 }
      );
    }

    // 👉 Đưa jti cũ vào blacklist với TTL = 2 phút
    tokenBlacklists.set(payloadJti, {
      jti: payloadJti,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });

      // 🧹 Cleanup các token hết hạn
    cleanupBlacklist();

    console.log("✅ Thêm vào blacklist:", payloadJti);
    console.log("Current blacklist:", Array.from(tokenBlacklists.keys()));

    // Sinh refresh token mới
    const { token: newRefreshToken, jti: newJti } = signRefreshToken({
      userId: userId,
    });
    const newJtiHash = await bcrypt.hash(newJti, 10);
    user.currentRefreshTokenJtiHash = newJtiHash;

    // Sinh access token mới
    const newAccessToken = signAccessToken({
      userId: userId,
      email: user.email,
    });

    const res = NextResponse.json({
      message: "Refresh thành công",
      accessToken: newAccessToken,
    });

    // Update cookies
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error("❌ Refresh error:", err);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
