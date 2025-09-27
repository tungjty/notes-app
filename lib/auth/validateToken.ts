import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { AuthReason } from "./authReasons";


export type TokenValidationResult =
    | { ok: true; code: AuthReason.AuthSuccess }
    | { ok: false; code: AuthReason.Unauthenticated }
    | { ok: false; code: AuthReason.SessionExpired };

export function validateToken(
    access_token?: string,
    refresh_token?: string
): TokenValidationResult {

    if (!access_token) return { ok: false, code: AuthReason.Unauthenticated };

    const accessPayload = verifyAccessToken(access_token);
    if (accessPayload) return { ok: true, code: AuthReason.AuthSuccess };


    // ❌ access token invalid/expired
    if (!refresh_token) return { ok: false, code: AuthReason.SessionExpired };


    const refreshPayload = verifyRefreshToken(refresh_token);
    if (!refreshPayload) return { ok: false, code: AuthReason.SessionExpired };


    // ✅ refresh hợp lệ → session vẫn valid
    return { ok: true, code: AuthReason.AuthSuccess };
}
