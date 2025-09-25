"use client";

// export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Note = { id: string; content: string };

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/check-token", {
          method: "GET",
          credentials: "include", // bắt buộc để gửi cookie HttpOnly
          cache: "no-store", // không dùng cache cũ
          signal: ac.signal,
        });

        if (res.status === 401) {
          console.log("⚠️ kết quả trả về là status === 401");
          // session invalid / expired -> redirect to login with reason + callback
          const callback = encodeURIComponent(window.location.pathname + window.location.search);
          router.replace(`/login/httpOnly/cookie?reason=session_expired&callback_url=${callback}`);
          return;
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          setError(`Server errored: ${text}`);
          return;
        }

        const data = await res.json();
        setNotes(data || []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return; // unmounted
        console.error("Fetch notes failed:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      ac.abort();
    };
  }, [router]);

  if (loading) return <div>Đang tải ghi chú...</div>;
  if (error) return <div className="text-red-600">Lỗi: {error}</div>;

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className="text-xl font-bold">Notes</h1>
      {notes.length === 0 ? (
        <p>Chưa có note nào.</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id}>{n.content}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
