import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

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

    const accessToken = "dummy-access-token-abc123";
    const refreshToken = "dummy-refresh-token-xyz789";

    return NextResponse.json({
      message: "Login successful",
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
