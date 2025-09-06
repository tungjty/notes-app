// lib/fetchWithHttpOnlyAuth.ts
export async function fetchWithHttpOnlyAuth(
  input: RequestInfo | URL
): Promise<Response> {
  // Gọi API chính
  const res = await fetch(input, {
    // ⚡ Không cần headers Authorization → browser tự gửi cookie HttpOnly
    method: "GET",
    credentials: "include", // 👈 đảm bảo cookie đi kèm request (an toàn)
  });

  if (res.ok) return res;

  // Parse lỗi JSON nếu có
  const data = await res.json();

  // Nếu không có access token → yêu cầu login lại
  if (data?.error === "No access token") {
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  // Nếu access token expired → thử refresh
  const refreshRes = await fetch("/api/refresh/httpOnly/cookie", {
    method: "POST",
  });
  const refreshData = await refreshRes.json();

  if (!refreshRes.ok) {
    throw new Error(refreshData?.error || "Không thể refresh token");
  }

  // ✅ Retry lại request ban đầu
  const retry = await fetch(input, {
    method: "GET",
    // ⚡ Không cần headers Authorization → browser tự gửi cookie HttpOnly
  });
  return retry;
}
