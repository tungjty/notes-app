// Logout (device hiện tại)

// Client gọi POST /api/logout/session (kèm cookie refreshToken).
// Server verify refreshToken → lấy userId & jti.
// Server tìm session tương ứng (so sánh payload.jti với jtiHash trong UserSession collection) và xóa session đó.
// Server trả response và clear cookies (accessToken, refreshToken) bằng cách set lại cookie với maxAge: 0.
// Client clear in-memory store (Zustand) và chuyển UI về trang login / hiển thị message.

// Logout all devices

// Client gọi POST /api/logout/session với body { all: true }.
// Server verify token → lấy userId.
// Server xóa hết mọi UserSession records cho userId (hoặc xóa theo nhiều hàng hợp lý).
// Server clear cookies như trên; client clear state.
// Kết quả: mọi refresh token trên các thiết bị sẽ không dùng được nữa (access token có thể vẫn tồn tại đến khi hết hạn).

// Chú ý: xóa session chỉ làm refresh không hợp lệ — access token ngắn hạn vẫn có thể hoạt động cho tới khi hết hạn. 
// Nếu cần force-invalidate immediate access tokens, cần token blacklist/short TTL.


import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import UserSession from "@/models/UserSession";
import { verifyRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // body: { all?: boolean }
    let body: { all?: boolean } = {};
    try {
      body = (await req.json()) as { all?: boolean };
    } catch {
      body = {};
    }
    const logoutAll = !!body.all;

    // Lấy refresh token từ cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;

    console.log("🚀 logoutAll ", logoutAll);
    console.log("🚀 refreshToken ", refreshToken);
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Không tìm thấy refresh token (vui lòng đăng nhập)" },
        { status: 401 }
      );
    }

    // Verify và lấy payload (userId, jti)
    let payload: { userId: string; jti?: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error("❌ Verify refresh token failed:", err);
      return NextResponse.json({ error: "Refresh token không hợp lệ" }, { status: 403 });
    }

    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 403 });
    }

    if (logoutAll) {
      // Xóa tất cả sessions của user
      await UserSession.deleteMany({ userId });
    } else {
      // Xóa đúng session hiện tại dựa trên jti
      const allSessions = await UserSession.find({ userId });
      let matchedSession = null;
      for (const s of allSessions) {
        // s.jtiHash là hash lưu trong DB
        const valid = await bcrypt.compare(payload.jti ?? "", s.jtiHash);
        if (valid) {
          matchedSession = s;
          break;
        }
      }

      if (!matchedSession) {
        // Nếu không match, có thể session đã bị revoke / expired
        return NextResponse.json({ error: "Session hiện tại không tìm thấy" }, { status: 404 });
      }

      await UserSession.deleteOne({ jtiHash: matchedSession.jtiHash });
    }

    // Clear cookies trên client (overwrite với maxAge = 0)
    const res = NextResponse.json({
      message: logoutAll ? "Đã đăng xuất toàn bộ thiết bị" : "Đã đăng xuất thiết bị này",
    });

    res.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ error: "Lỗi server khi logout" }, { status: 500 });
  }
}
