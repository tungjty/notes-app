// app/login/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function loginAction(formData: FormData, callback_url: string) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  console.log("📥 Login input:", { email, password });

  await connectDB();

  const user = await User.findOne({ email });
  console.log("user in db:", user);

  if (!user) return { error: "Không tìm thấy user trong db" };

  if (email === "a@gmail.com" && password === "1") {

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

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // nếu strict bị drop trong tab mới (production mode)
      maxAge: 60 * 15, // (60 * 15 = 15 phút)
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // nếu strict bị drop trong tab mới (production mode)
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    console.log("✅ [ loginAction.ts ] Login success, redirect -> /dashboard");

    redirect(callback_url);
  }

  return { error: "Email hoặc mật khẩu không đúng" };
}
