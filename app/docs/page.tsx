"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { handleApiError } from "@/lib/handleApiError";

type Document = { id: number; title: string };

export default function HomePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await fetchWithAuth("/api/docs");
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setDocs(data);
      setError(null);
    } catch (error: unknown) {
      // 👉 UI chỉ hiển thị message gọn gàng
      setError(handleApiError(error, "Lỗi khi fetch docs"));
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Documents</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {docs.map((n) => (
          <li key={n.id}>{n.title}</li>
        ))}
      </ul>
    </main>
  );
}
