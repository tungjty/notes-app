import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    
    // console.log("Server nhận refreshToken = ", refreshToken);
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Phiên đăng nhập đã hết hạn, vui lòng login lại" },
        { status: 401 }
      );
    }

    // ✅ Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error("❌ Invalid refresh token", err);
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.currentRefreshTokenHash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ So sánh jti, trả về `true` nếu đúng token mới nhất, `false` nếu token cũ
    // (vì jti là unique cho mỗi refresh token)
    const isValid = await bcrypt.compare(payload.jti, user.currentRefreshTokenHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Refresh token is no longer valid" },
        { status: 403 }
      );
    }

    // 👉 Access token mới
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // 👉 Refresh token mới + jti mới
    const { token: newRefreshToken, jti: newJti } = signRefreshToken({
      userId: user._id.toString(),
    });

    // Hash jti mới và lưu DB
    const newHash = await bcrypt.hash(newJti, 10);
    user.currentRefreshTokenHash = newHash;
    await user.save();

    // Gửi cookie mới + access & access token mới
    const res = NextResponse.json({ accessToken: newAccessToken });
    res.cookies.set("accessToken", newAccessToken, {
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
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
