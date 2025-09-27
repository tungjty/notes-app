// app/api/auth/me/route.ts
import { validateToken } from "@/lib/auth/validateToken";
import { AuthReason } from "@/lib/auth/authReasons";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const result = validateToken(accessToken, refreshToken);

  if (result.ok) {
    return NextResponse.json(
      { ok: true, code: result.code },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ❌ not ok
  let status = 401;
  switch (result.code) {
    case AuthReason.Unauthenticated:
      status = 401;
      break;
    case AuthReason.SessionExpired:
      status = 440; // 440 = Login Time-out (Microsoft extension)
      break;
    default:
      status = 401;
  }

  return NextResponse.json(
    { ok: false, code: result.code, error: result.code },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}
