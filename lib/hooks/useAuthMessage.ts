"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAuthMessage } from "@/lib/auth/authMessages";
import { AuthReason } from "../auth/authReasons";

/**
 * Custom hook quản lý thông báo auth message
 * - Lấy message từ URL param ?reason=...
 * - Cho phép setMessage() thủ công (vd khi login fail)
 */
export function useAuthMessage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as AuthReason | null;

  // init state từ reason
  const [message, setMessage] = useState<string | null>(() => getAuthMessage(reason));

  // Nếu URL reason thay đổi → update lại state
  useEffect(() => {
    setMessage(getAuthMessage(reason));
  }, [reason]);

  return { message, setMessage };
}
