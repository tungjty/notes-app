import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import LoginAttempt from "@/models/LoginAttempt";

const MAX_FAILS = 5; // cho phép tối đa 5 lần
const LOCK_TIME = 5 * 60 * 1000; // khóa 5 phút

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    // const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.ip ||"unknown";

    // 1. Tìm login attempt record
    const attempt = await LoginAttempt.findOne({ email, ip });
    if (attempt) {
      // Check nếu đang bị khóa
      const isLocked =
        attempt.failCount >= MAX_FAILS &&
        Date.now() - attempt.lastFailedAt.getTime() < LOCK_TIME;

      if (isLocked) {
        return NextResponse.json(
          {
            error: `❌ Too many failed attempts. Try again after ${Math.ceil(
              LOCK_TIME / 60000
            )} minutes.`,
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Nếu login failed, tăng failCount
      if (attempt) {
        attempt.failCount += 1;
        attempt.lastFailedAt = new Date();
        await attempt.save();
      } else {
        // Tạo record mới nếu chưa có
        await LoginAttempt.create({
          email,
          ip,
          failCount: 1,
          lastFailedAt: new Date(),
        });
      }
      return NextResponse.json(
        { error: "❌ Sai password, vui lòng thử lại" },
        { status: 401 } // Unauthorized
      );
    } else {
      // Nếu login thành công, reset failCount
      if (attempt) await LoginAttempt.deleteOne({ _id: attempt._id });
    }

    // 👉 Tạo token bằng lib/jwt.ts
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const { token: refreshToken } = signRefreshToken({
      userId: user._id.toString(),
    });
    console.log({ refreshToken });

    return NextResponse.json({
      message: "Login successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Login error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
