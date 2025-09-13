import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { handleApiError } from "@/lib/handleApiError";

const dummyDocs = [
  { id: 1, title: "First document" },
  { id: 2, title: "Second document" },
];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  // ❌ Không có Authorization header
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  // console.log("🔑 Received token:", token);

  try {
    const payload = verifyAccessToken(token); // sẽ throw nếu token không hợp lệ
    if (process.env.NODE_ENV === "development")
      console.log("✅ Token payload:", payload);

    return NextResponse.json(dummyDocs);
  } catch (error) {
    handleApiError(error, "❌ Verify access token error");
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
