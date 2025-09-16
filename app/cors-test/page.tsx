"use client";

//  ⚠ Cross origin request detected from 192.168.1.3 to /_next/* resource. In a future major version of Next.js,
// you will need to explicitly configure "allowedDevOrigins" in next.config to allow this.
// Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins

import { Button } from "@heroui/react";
import { useState } from "react";

export default function PingTest() {
  const [result, setResult] = useState("");

  const callPing = async (method: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/ping-cors", {
        method,
        credentials: "include", // 👈 Quan trọng: gửi cookie kèm theo
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": "x-csrf-token-abc123",
          // "X-Middleware-Token": "x-middleware-token-abc123",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // same-origin -> browser sẽ KHÔNG expose các header CORS (nên get sẽ null)
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
        "❌ Lỗi (CORS blocked or server unreachable): " +
          (err instanceof Error ? err.message : "Unknown error occurred")
      );
    }
  };

  const callPublicPrivateAPI = async (
    segment: "public" | "private",
    method: string
  ) => {
    try {
      const res = await fetch(`http://localhost:3000/api/${segment}/ping`, {
        method,
        credentials: "include", // gửi cookie nếu có
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Nếu cùng same-origin (http://localhost:3000 gọi http://localhost:3000)
      // -> thấy (res.ok === false) khi server return 403/405.
      // Nếu khác origin -> browser chặn kết quả trước khi JS thấy được -> luôn vào catch()
      if (!res.ok) {
        // ❌ Server trả về lỗi (403, 405, 500...)
        console.log(`lỗi (403, 405, 500...) `);
        const text = await res.text(); // đọc plain text luôn (middleware trả text)
        setResult(`❌ ${text}`);
        return;
      }
      // ✅ OK → parse json
      const data = await res.json();
      setResult(`✅ GET response=${JSON.stringify(data)}`);
    } catch (err: unknown) {
      setResult(
        "❌ Lỗi (CORS blocked or server unreachable): " +
          (err instanceof Error ? err.message : "Unknown error occurred")
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        👇 Buttons này sẽ REQUEST đến{" "}
        <code>http://localhost:3000/api/ping-cors</code>
      </div>
      <Button
        className="mt-4"
        variant="flat"
        color="primary"
        onPress={() => callPing("GET")}
      >
        Call GET /api/ping
      </Button>
      <Button
        className="mt-4"
        variant="flat"
        color="secondary"
        onPress={() => callPing("POST")}
      >
        Call POST /api/ping
      </Button>

      <div>
        👇 Button này sẽ REQUEST đến{" "}
        <code>http://localhost:3000/api/public/ping</code> để test{" "}
        <code>Per-Route CORS Rules</code>
      </div>
      <Button
        className="mt-4"
        variant="flat"
        color="success"
        onPress={() => callPublicPrivateAPI("public", "POST")}
      >
        Call GET /api/public/ping
      </Button>
      <div>
        👇 Button này sẽ REQUEST đến{" "}
        <code>http://localhost:3000/api/private/ping</code> để test{" "}
        <code>Per-Route CORS Rules</code>
      </div>
      <Button
        className="mt-4"
        variant="flat"
        color="danger"
        onPress={() => callPublicPrivateAPI("private", "GET")}
      >
        Call GET /api/private/ping
      </Button>

      <pre className="mt-2">{result}</pre>
    </div>
  );
}
