import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    verifyAccessToken(token);
    return NextResponse.json("✅ Message: fetch docs thành công!");
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired access token" },
      { status: 401 }
    );
  }
}
