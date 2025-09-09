import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { verifyRefreshToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST() {
  try {
    await connectDB();

    // 👉 Lấy refresh token từ cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken) as { userId: string };

        // 👉 Xóa refresh token hash trong DB
        await User.findByIdAndUpdate(payload.userId, {
          $unset: { currentRefreshTokenHash: 1 },
        });
      } catch (err) {
        console.warn("⚠️ Refresh token không hợp lệ khi logout:", err);
        // vẫn tiếp tục clear cookies dù refresh token sai
      }
    }

    // 👉 Xóa cookies
    const res = NextResponse.json({ message: "Logged out successfully" });

    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error: unknown) {
    console.error("❌ Logout error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
