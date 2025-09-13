import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 👇 Lấy header Cookie
  // Chuyển cookie string → object { key: value }
  const cookieHeader = req.headers.get("cookie") || "";
  console.log("🍪 Raw Cookie Header:", cookieHeader);

  // Parse cookie thành object { key: value }
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );

  console.log("🔎 Parsed Cookies:", cookies);

  // 👉 Lấy token từ cookie
  const token = cookies.accessToken;

  if (!token) {
    return NextResponse.json(
      { error: "No access token in cookies" },
      { status: 401 }
    );
  }

  // 👇 Demo verify: token hợp lệ nếu là chuỗi "dummy-access-token-abc123"
  if (token !== "dummy-access-token-abc123") {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // ✅ Trả về data giả lập
  return NextResponse.json([
    { id: 1, title: "Cookie-based doc A" },
    { id: 2, title: "Cookie-based doc B" },
  ]);
}
