"use client";

import { useState, useEffect } from "react";
import { getAuthMessage } from "@/lib/auth/authMessages";
import { AuthReason } from "../auth/authReasons";

/**
 * Custom hook quản lý thông báo auth message
 * - Lấy message từ URL param ?reason=...
 * - Cho phép setMessage() thủ công (vd khi login fail)
 */
export function useAuthMessage(reason: string | null) {
  const reasonAsAuth = reason as AuthReason | null; // type assertion
  // init state từ reason
  const [message, setMessage] = useState<string | null>(() =>
    getAuthMessage(reasonAsAuth)
  );

  // Nếu URL reason thay đổi → update lại state
  useEffect(() => {
    setMessage(getAuthMessage(reasonAsAuth));
  }, [reasonAsAuth]);

  return { message, setMessage };
}
