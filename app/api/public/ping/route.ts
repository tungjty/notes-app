import { NextResponse } from "next/server";

export async function GET() {
  // Public route → cho phép mọi origin
  return NextResponse.json({ message: "pong from PUBLIC ✅" });
}