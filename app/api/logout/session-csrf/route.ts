import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import SessionCSRF from "@/models/SessionCSRF";

export async function POST() {
  await connectDB();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "Không tìm thấy session của bạn, bạn đã đăng xuất" }, { status: 200 });
  }
  // Xoá session trong DB
  await SessionCSRF.deleteOne({ sessionId });

  // Xoá cookie (set expired)
  cookieStore.set("sessionId", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json({ message: "Bạn đã đăng xuất, hẹn gặp lại" });
}
