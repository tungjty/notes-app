import { NextRequest } from "next/server";
import jsonAllowed from "./allowed-origins.json"; // ✅ Edge runtime cho phép
import rulesConfig from "./cors-rules.json";
import { handleNoRuleCors } from "./handleNoRuleCors";
import { handleRuleCors } from "./handleRuleCors";

export type Rule = {
  path: string;
  origins: string[];
  methods: string[];
  headers: string[];
};

export interface CorsResult {
  headers: Record<string, string>;
  flags: {
    "x-preflight"?: "1";
    "x-blocked"?: "1";
    "x-method-not-allowed"?: "1";
  };
}

// ✅ Helper: lấy ra các domains có thể gọi API
function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS)
    return process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

  return jsonAllowed.origins;
}

// Helper: tìm rule theo pathname
function findCorsRule(pathname: string): Rule | undefined {
  return rulesConfig.rules.find((rule) => pathname.startsWith(rule.path));
}

export function handleCors(req: NextRequest): CorsResult | null {
  const origin = req.headers.get("origin") ?? req.nextUrl.origin;
  const isSameOrigin = !origin || origin === req.nextUrl.origin;
  const { pathname } = req.nextUrl;

  const headers: Record<string, string> = {
    Vary: "Origin", // 👈 safe for cache
  };
  const flags: CorsResult["flags"] = {};

  if (process.env.NODE_ENV !== "production") {
    console.log(`origin :`, req.headers.get("origin"));
    console.log(`isSameOrigin :`, isSameOrigin);
  }

  const rule = findCorsRule(pathname);
  const ALLOWED_ORIGINS = getAllowedOrigins();

  // ❌ Chưa có rule nào ( ex, `/api/test`, `/api/login`...) 👇
  if (!rule) {
    if (process.env.NODE_ENV !== "production")
      console.log(`Chưa có rule nào được set với pathname: `, pathname);
    return handleNoRuleCors(
      origin,
      isSameOrigin,
      ALLOWED_ORIGINS,
      req.method,
      headers,
      flags
    );
  }

  // ✅ Có rule (ex, `/api/public`, `/api/private` ...) 👇
  if (process.env.NODE_ENV !== "production")
    console.log(
      `🔧 CORS matched rule for ${pathname}, 
        origin=${origin}, 
        methods=${rule.methods.join(",")}`
    );
  return handleRuleCors(rule, origin, req.method, headers, flags);
}
