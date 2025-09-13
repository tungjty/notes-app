// lib/handleApiError.ts
export function handleApiError(error: unknown, defaultMsg = "Đã xảy ra lỗi") {
  // 👉 Dev mode thì log nhẹ cho debug
  if (process.env.NODE_ENV === "development") {
    console.warn(defaultMsg, error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMsg;
}
