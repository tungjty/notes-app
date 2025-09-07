import { useAuthStore } from "@/store/auth";

// Custom Errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ServerError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ServerError";
    this.status = status;
  }
}

// ==== Error Messages ====
const ERRORS = {
  NO_ACCESS: "No access token",
  REFRESH_EXPIRED: "Refresh token expired or invalid",
  REFRESH_FAILED: "Không lấy được access token mới",
} as const;

// ==== Refresh API type ====
type RefreshResponse = { accessToken: string };

// Main Auth Client
export const authClient = {
  async fetchWithAuth(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    const { accessToken, setAccessToken } = useAuthStore.getState();

    // 🚨 Nếu không có access token trong memory → yêu cầu login lại
    if (!accessToken) {
      throw new AuthError(ERRORS.NO_ACCESS);
    }

    // helper nhỏ để fetch kèm token
    const doFetch = (token: string) =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      });

    // 1️⃣ Fetch lần đầu: 👉 Gửi request với access token hiện tại
    let res = await doFetch(accessToken);

    // 2️⃣ Nếu 401 → thử refresh
    if (res.status === 401) {
      console.warn("⚠️ Access token expired, thử refresh...");

      const refreshRes = await fetch("/api/refresh/zustand-httpOnly", {
        method: "POST",
        credentials: "include", // gửi refresh token trong HttpOnly cookie
      });

      if (!refreshRes.ok) {
        throw new AuthError(ERRORS.REFRESH_EXPIRED);
      }

      const data: RefreshResponse = await refreshRes.json();
      if (!data.accessToken) {
        throw new AuthError(ERRORS.REFRESH_FAILED);
      }

      // ✅ Cập nhật access token mới vào Zustand
      setAccessToken(data.accessToken);

      // 👉 Retry với token mới
      res = await doFetch(data.accessToken);
    }

    if (!res.ok) {
      throw new ServerError(
        `Request failed with status ${res.status}`,
        res.status
      );
    }

    return res;
  },
};
