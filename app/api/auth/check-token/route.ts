// app/api/me/check-token/route.ts
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function checkTokenValid(token?: string): boolean {
  if (!token) return false;

  const payload = verifyAccessToken(token);

  if (!payload) return false;

  // ✅ token ok -> cho đi tiếp
  return true;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

   // 👇 (optional) giả lập delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!checkTokenValid(accessToken)) {
    // 401 để client biết phải redirect
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Trả data notes thật ở đây
  const notes = [
    { id: "1", content: "Note A (test)" },
    { id: "2", content: "Note B (test)" },
  ];

  return NextResponse.json(notes, { headers: { "Cache-Control": "no-store" } });

  return NextResponse.json({ ok: true });
}
