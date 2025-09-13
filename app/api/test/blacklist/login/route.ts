// app/api/test/blacklist/login/route.ts
import { NextResponse } from "next/server";
import { users } from "@/lib/db_mock";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const email = "a@gmail.com";

    // Fake generate userId (dùng timestamp cho đơn giản)
    const userId = Date.now().toString();

    // 👉 Tạo token
    const accessToken = signAccessToken({ userId, email: email, });
    const { token: refreshToken, jti } = signRefreshToken({ userId });

    // 👉 Hash jti lưu vào fake DB
    const jtiHash = await bcrypt.hash(jti, 10);

    // Save user vào fake DB (key = userId)
    users.set(userId, {
      id: userId,
      email,
      currentRefreshTokenJtiHash: jtiHash,
    });

    // 👉 Trả về JSON + set cookie
    const res = NextResponse.json({
      message: "Login (fake) thành công",
      user: { id: userId, email },
      accessToken,
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 phút
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    console.log("✅ Fake user login:", users.get(userId)?.email);
    console.log("➡️ Access Token:", accessToken);
    console.log("➡️ Refresh Token:", refreshToken);
    console.log("➡️ New refresh jti:", jti);
    console.log("➡️ New refresh jti hash saved:", users.get(userId)?.currentRefreshTokenJtiHash);

    return res;
  } catch (error) {
    console.error("❌ Login (fake) error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
