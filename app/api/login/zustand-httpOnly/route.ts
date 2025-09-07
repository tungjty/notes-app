// Flow demo

// Login:
// Server tạo access token (ngắn hạn, ví dụ 15 phút) trả về client.
// Server tạo refresh token (dài hạn, 7 ngày), hash jti lưu DB, set trong HttpOnly cookie.
// Client nhận access token → lưu vào Zustand store (memory only).

// Fetch docs:
// Client lấy access token từ Zustand → gửi kèm Authorization: Bearer ....
// Server verify access token:
// Nếu valid → trả dữ liệu docs.
// Nếu expired/invalid → server trả 401 Unauthorized.
// Client bắt lỗi 401 → gọi refresh API:
// Refresh API đọc refresh token từ HttpOnly cookie.
// Nếu hợp lệ (bcrypt.compare jti hash đúng) → server cấp access token mới.
// Client update access token vào Zustand store → fetch lại docs.
// Nếu refresh cũng fail → logout.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và password là bắt buộc" },
        { status: 400 }
      );
    }

    await connectDB();

    // 👇 (optional) giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 👇 giả lập login failed
    // throw new Error("❌ Failed to login");

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "❌ Không tìm thấy user trong db" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "❌ Sai password, vui lòng thử lại" },
        { status: 401 }
      );
    }

    // 👉 Tạo access token & refresh token
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const { token: refreshToken, jti } = signRefreshToken({
      userId: user._id.toString(),
    });

    // 👉 Hash jti và lưu vào DB
    const hashedJti = await bcrypt.hash(jti, 10);
    user.currentRefreshTokenHash = hashedJti;
    await user.save();

    const res = NextResponse.json({
      message: "Login successfully",
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });

    // httpOnly
    // Không cho JS truy cập (ngăn XSS đánh cắp token).

    // secure
    // Nếu bật → cookie chỉ gửi qua HTTPS.
    // Nếu false (dev mode) → cookie cũng gửi qua HTTP.
    // Trong production bạn luôn nên bật secure: true.

    // sameSite
    // Bảo vệ chống CSRF (Cross-Site Request Forgery).

    // Strict: chỉ gửi cookie nếu request từ cùng site/domain. → An toàn nhất.
    // Lax: mặc định hiện nay, cho phép một số request “an toàn” (GET, HEAD, link click) gửi cookie cross-site.
    // None: cookie sẽ được gửi trong mọi request cross-site → bắt buộc phải kèm Secure.

    // path
    // Quy định cookie có hiệu lực cho route nào.
    // "/" → toàn bộ site.
    // "/api" → chỉ gửi cookie khi request tới /api/....

    // maxAge / expires
    // Thời hạn sống của cookie.
    // maxAge: tính bằng giây.
    // expires: mốc thời gian cụ thể.

    // 👉 Set HttpOnly cookie
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (error: unknown) {
    console.error("❌ Login error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
