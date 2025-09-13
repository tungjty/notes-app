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

    // 👇 giả lập delay N giây
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 👇 giả lập create note failedÏ
    // throw new Error("❌ Failed to register");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "❌ Email đã tồn tại" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        user: { id: newUser._id, email: newUser.email },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Register error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
