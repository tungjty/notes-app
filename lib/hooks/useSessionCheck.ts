"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthReason } from "@/lib/auth/authReasons";

export function useSessionCheck() {
  const [state, setState] = useState({
    loading: true,
    code: null as AuthReason | null,
    error: null as string | null,
  });

  const searchParams = useSearchParams(); 
  const reason = searchParams.get("reason"); // 👈 dependency mới

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
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
  }, [reason]); // 👈 rerun khi query param thay đổi

  return state;
}
