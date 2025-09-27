// lib/auth/authReasons.ts
export enum AuthReason {
  Unauthenticated = "unauthenticated",
  SessionExpired = "session_expired",
  Unauthorized = "unauthorized",
  TokenRefreshed = "token_refreshed",
  TokenRefreshFailed = "token_refresh_failed",
  AuthError = "auth_error",
  AuthSuccess = "auth_success",
  LogoutSucces = "logout_success"
}
