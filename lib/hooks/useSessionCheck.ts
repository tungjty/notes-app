"use client";

import { useEffect, useState } from "react";
import { AuthReason } from "@/lib/auth/authReasons";

type SessionState = {
  loading: boolean;
  code: AuthReason | null;
  error: string | null;
};

export function useSessionCheck() {
  const [state, setState] = useState<SessionState>({
    loading: true,
    code: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // để gửi cookies HttpOnly
          cache: "no-store",
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.ok) {
          setState({ loading: false, code: data.code, error: null });
        } else {
          setState({ loading: false, code: data.code, error: data.error });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setState({
          loading: false,
          code: null,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}