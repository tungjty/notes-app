import { CorsResult } from "./handleCors";

// ✅ Khi không có rule CORS nào match
export function handleNoRuleCors(
  origin: string,
  isSameOrigin: boolean,
  ALLOWED_ORIGINS: string[],
  method: string,
  headers: Record<string, string>,
  flags: CorsResult["flags"]
) {
  // ❌ Origin không hợp lệ → block request
  if (!isSameOrigin && !ALLOWED_ORIGINS.includes(origin)) {
    flags["x-blocked"] = "1";
    return { headers, flags };
  }

  //  ✅ Hợp lệ → cho đi tiếp + set header
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Credentials"] = "true"; // credentials includes 👈
  headers["Access-Control-Allow-Methods"] = "GET,OPTIONS";
  headers["Access-Control-Allow-Headers"] =
    "Content-Type, X-CSRF-Token, Authorization";
  // 👇 Cho phép client đọc lại các header này
  headers["Access-Control-Expose-Headers"] =
    "Access-Control-Allow-Origin, Access-Control-Allow-Credentials";

  if (method === "OPTIONS") {
    console.log("🔎 Preflight OPTIONS received from:", origin);
    flags["x-preflight"] = "1";
    // Next.js (App Router + Route Handler) xử lý OPTIONS mặc định
    // trả về 204 No Content mặc định, kèm header Access-Control-Allow-Origin
  }
  return { headers, flags };
}
