// lib/fetchWithAuth.ts
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = localStorage.getItem("accessToken");

  // ❌ Không có access token → coi như chưa đăng nhập
  if (!accessToken) {
    handleLogout();
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }

  // Gắn access token vào header
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Nếu access token không đúng / hết hạn → thử refresh
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      handleLogout();
      throw new Error("No refresh token, please login again");
    }

    const refreshRes = await fetch("/api/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      handleLogout();
      throw new Error("Refresh token expired, please login again");
    }

    const data = await refreshRes.json();
    localStorage.setItem("accessToken", data.accessToken);

    // Retry request với access token mới
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
  }

  return res;
}

function handleLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}
