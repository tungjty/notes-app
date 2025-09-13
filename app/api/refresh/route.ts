// app/api/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 400 }
      );
    }

    let payload;
    try {
      // ✅ verifyRefreshToken đã có type guard → luôn trả về { userId }
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error("❌ JWT verify error:", err);
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 👉 tạo access token mới
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch (error: unknown) {
    console.error("❌ Refresh token error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
