import fs from "fs";
import path from "path";

export function checkEnv(requiredKeys: string[]) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");

    if (!fs.existsSync(envPath)) {
      console.warn("❌ [checkEnv] .env.local file is missing!");
      return;
    }

    const content = fs.readFileSync(envPath, "utf-8");

    if (!content.trim()) {
      console.warn("⚠️ [checkEnv] .env.local is empty!");
      return;
    }

    requiredKeys.forEach((key) => {
      if (!process.env[key]) {
        console.warn(`⚠️ [checkEnv] Missing required env var: ${key}`);
      }
    });

    console.log("✅ [checkEnv] .env.local loaded successfully");
  } catch (err) {
    console.error("❌ [checkEnv] Failed to validate .env.local:", err);
  }
}
