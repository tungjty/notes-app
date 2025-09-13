// Bổ sung handler cho POST vào API /api/test/SameSite/profile để bạn test.
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return handleRequest(req, "GET");
}

export async function POST(req: Request) {
  return handleRequest(req, "POST");
}

function handleRequest(req: Request, method: string) {
  const cookieHeader = req.headers.get("cookie");
  const session = cookieHeader?.match(/session=([^;]+)/)?.[1];

  if (!session) {
    return NextResponse.json(
      { error: `No session cookie on ${method}` },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: session,
    method,
  });
}
