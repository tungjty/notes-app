// 🔑 Refresh Token Rotation là gì?
// Khi user login, server tạo ra refreshToken A và gửi về client (lưu trong cookie HttpOnly).
// Lần đầu access token hết hạn → client gửi refreshToken A lên để xin token mới.
// Server cấp accessToken mới + refreshToken B, đồng thời xoá/thu hồi refreshToken A.
// Lần sau client chỉ có thể dùng refreshToken B (A bị revoke rồi).
// Nếu hacker có được refreshToken A → không thể dùng được nữa (vì đã bị thay thế).

// 1. Khi login
// Tạo refreshToken → hash jti trong payload refreshToken (dùng bcrypt) → lưu vào DB.
// Gửi refreshToken gốc về client (cookie HttpOnly).

// 2. Khi refresh
// Verify refreshToken hợp lệ về mặt chữ ký JWT.
// So sánh hash jti trong payload của refreshToken với DB. Nếu không match → reject.
// Nếu match → cấp refreshToken mới, hash và lưu vào DB (ghi đè).
// Gửi refreshToken mới cho client (cookie HttpOnly).

// 3. Khi logout
// clear cookies + xóa refresh token jti hash DB (set null) → đảm bảo không reuse lại được.

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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 👇 giả lập login failed
    // throw new Error("❌ Failed to login");

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy user trong db" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Sai password, vui lòng thử lại" },
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

    // 👉 Set HttpOnly cookies
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Vì sao ở local thì ok, còn Vercel thì lần mở tab đầu lại redirect về login?
      // ÷Trường hợp này xảy ra khá thường khi deploy lên Vercel, nguyên nhân chủ yếu 
      // đến từ middleware chạy trước khi trình duyệt kịp gửi cookie trong tab mới
      sameSite: "lax", // nếu strict bị drop trong tab mới (production mode)
      path: "/",
      maxAge: 60 * 15, // (60 * 15 = 15 phút)
    });
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // nếu strict bị drop trong tab mới (production mode)
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
