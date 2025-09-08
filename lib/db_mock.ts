// lib/db.ts (mock DB đơn giản bằng Map)

type UserRecord = {
  id: string;
  email: string;
  currentRefreshTokenJtiHash: string | null;
};

type BlacklistRecord = {
  jti: string;
  expiresAt: number;
};

// Tạo biến global để tránh reset trong dev/HMR
const globalForMock = globalThis as unknown as {
  users?: Map<string, UserRecord>;
  tokenBlacklists?: Map<string, BlacklistRecord>;
};

// Nếu đã tồn tại trong global thì dùng lại, nếu chưa thì khởi tạo mới
export const users =
  globalForMock.users ?? new Map<string, UserRecord>();

export const tokenBlacklists =
  globalForMock.tokenBlacklists ?? new Map<string, BlacklistRecord>();

// Gán lại vào global để giữ state khi HMR (Hot Reload)
if (!globalForMock.users) globalForMock.users = users;
if (!globalForMock.tokenBlacklists) globalForMock.tokenBlacklists = tokenBlacklists;

// Hàm dọn rác blacklist (xóa token đã hết hạn)
export function cleanupBlacklist() {
  const now = Date.now();
  for (const [jti, entry] of tokenBlacklists.entries()) {
    if (entry.expiresAt <= now) {
      tokenBlacklists.delete(jti);
      console.log(`🧹 Cleanup: removed expired jti ${jti}`);
    }
  }
}

