"use client";

import { Button } from "@heroui/react";
import { useState } from "react";

export default function PingTest() {
  const [result, setResult] = useState("");

  const callPing = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/test/SameSite/ping", {
        method: "GET",
        credentials: "include", // 👈 Quan trọng: gửi cookie kèm theo
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Vì bạn chạy same-origin (127.0.0.1:3000),
      // browser sẽ KHÔNG expose các header CORS (nên get sẽ null)
      const allowCreds = res.headers.get("Access-Control-Allow-Credentials");
      const allowOrigin = res.headers.get("Access-Control-Allow-Origin");

      const data = await res.json();

      setResult(
        `✅ allowOrigin=${allowOrigin}, allowCreds=${allowCreds}, response=${JSON.stringify(
          data
        )}`
      );
    } catch (err: unknown) {
      setResult(
        "❌ Error: " +
          (err instanceof Error ? err.message : "Unknown error occurred")
      );
    }
  };

  const callPingPost = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/test/SameSite/ping", {
        method: "POST",
        credentials: "include", // gửi cookie kèm theo
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": "x-csrf-token-abc123",
        },
        body: JSON.stringify({ hello: "world" }),
      });

      const data = await res.json();

      setResult(`✅ POST response=${JSON.stringify(data)}`);
    } catch (err: unknown) {
      setResult(
        "❌ Error: " +
          (err instanceof Error ? err.message : "Unknown error occurred")
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Button
        className="mt-4"
        variant="flat"
        color="primary"
        onPress={callPing}
      >
        Call GET /api/ping
      </Button>
      <Button
        className="mt-4"
        variant="flat"
        color="secondary"
        onPress={callPingPost}
      >
        Call GET /api/ping
      </Button>

      <pre className="mt-2">{result}</pre>
    </div>
  );
}
