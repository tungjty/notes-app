"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  const login = async (mode: string) => {
    await fetch(`/api/test/SameSite/login?mode=${mode}`);
  };

  const getProfile = async () => {
    const res = await fetch("/api/test/SameSite/profile", {
      credentials: "include",
    });
    const json = await res.json();
    setMessage(JSON.stringify(json, null, 2));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login (SameSite mode)</h2>
        <div className="flex gap-2">
          <Button
            className="mt-4"
            color="primary"
            onPress={() => login("Strict")}
          >
            Login (Strict)
          </Button>

          <Button
            className="mt-4"
            color="secondary"
            onPress={() => login("Lax")}
          >
            Login (Lax)
          </Button>
          <Button
            className="mt-4"
            color="success"
            onPress={() => login("None")}
          >
            Login (None)
          </Button>
        </div>
        <Button
          className="mt-4"
          variant="flat"
          color="success"
          onPress={getProfile}
        >
          Get Profile
        </Button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </Card>
    </div>
  );
}
