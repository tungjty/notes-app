import { CorsResult, Rule } from "./handleCors";

export function handleRuleCors(
  rule: Rule,
  origin: string,
  method: string,
  headers: Record<string, string>,
  flags: CorsResult["flags"]
) {
  // Check origin có nằm trong allowed origins?
  const isAllowed = rule.origins.includes("*") || rule.origins.includes(origin);

  if (!isAllowed) {
    flags["x-blocked"] = "1";
    return { headers, flags };
  }

  // Nếu method không được phép
  if (!rule.methods.includes(method)) {
    flags["x-method-not-allowed"] = "1";
    return { headers, flags };
  }

  //  ✅ Hợp lệ → cho đi tiếp + set header
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Credentials"] = "true";
  headers["Access-Control-Allow-Methods"] = rule.methods.join(", ");
  headers["Access-Control-Allow-Headers"] = rule.headers.join(", ");

  // Preflight request (OPTIONS)
  if (method === "OPTIONS") {
    flags["x-preflight"] = "1";
  }
  return { headers, flags };
}
