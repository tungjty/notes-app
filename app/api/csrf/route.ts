import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import SessionCSRF from "@/models/SessionCSRF";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session cookie" }, { status: 401 });
  }

  const newToken = generateToken();
  const updated = await SessionCSRF.findOneAndUpdate(
    { sessionId },
    { csrfToken: newToken, updatedAt: new Date() },
    { new: true }
  );

  if (!updated)
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const res = NextResponse.json({ csrfToken: newToken });
  res.headers.set("x-csrf-token", newToken);
  
  return res;
}
