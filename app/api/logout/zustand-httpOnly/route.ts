import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/jwt";

export async function POST() {
  try {

    await connectDB();

    // 👉 Lấy refresh token từ cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const payload = decodeToken(refreshToken) as { userId: string };

        // 👉 Xóa refresh token hash trong DB
        await User.findByIdAndUpdate(payload.userId, {
          $unset: { currentRefreshTokenHash: 1 },
        });
      } catch (err) {
        console.warn("⚠️ Refresh token không hợp lệ khi logout:", err);
        // vẫn tiếp tục clear cookies dù refresh token sai
      }
    }


    // 👉 Xóa refresh token in httpOnly cookies
    const res = NextResponse.json({ message: "Logged out successfully" });
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json(
      { error: "Logout error occurred" },
      { status: 500 }
    );
  }
}
