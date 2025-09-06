import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
  "15m") as string;
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ||
  "7d") as string;

/**
 * Kiểu payload chuẩn của JWT mình dùng trong app
 */
export interface AccessTokenPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
  jti: string; // 👈 thêm jti để đảm bảo refresh token luôn unique
}

// --------- SIGN ---------
export function signAccessToken(payload: { userId: string; email: string }) {
  if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET not set");
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: { userId: string }) {
  if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET not set");
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, jti }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return { token, jti }; // 👈 trả về token kèm jti
}

// --------- VERIFY ---------
export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET not set");

  // ❌ Nếu access token invalid hoặc expired → jwt.verify sẽ throw error
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  // ✅ Type guard
  if (!decoded.userId || !decoded.email) {
    throw new Error("Invalid access token payload");
  }
  return decoded;
}

export function verifyRefreshToken(token: string) {
  if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET not set");

  const decoded = jwt.verify(
    token,
    REFRESH_TOKEN_SECRET
  ) as RefreshTokenPayload;

  if (!decoded.userId) {
    throw new Error("Invalid refresh token payload");
  }
  return decoded;
}
