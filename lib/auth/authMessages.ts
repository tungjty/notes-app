// lib/auth/authMessages.ts
import { AuthReason } from "./authReasons";

export const authMessages: Record<AuthReason, string> = {
  [AuthReason.Unauthenticated]: "Vui lòng đăng nhập để tiếp tục",
  [AuthReason.SessionExpired]: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  [AuthReason.Unauthorized]: "Bạn không có quyền truy cập trang này",
  [AuthReason.TokenRefreshed]: "Phiên làm việc đã được làm mới",
  [AuthReason.TokenRefreshFailed]: "Không thể làm mới phiên đăng nhập, vui lòng đăng nhập lại",
  [AuthReason.AuthError]: "Có lỗi xảy ra khi xác thực, vui lòng thử lại",
  [AuthReason.AuthSuccess]: "Phiên đăng nhập vẫn còn hiệu lực",
  [AuthReason.LogoutSucces]: "Bạn đã đăng xuất thành công"
};

// Helper
export function getAuthMessage(reason: AuthReason | null): string | null {
  if (!reason) return null;
  return authMessages[reason] || null;
}

