// models/LoginAttempt.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILoginAttempt extends Document {
  email: string;
  ip: string;
  failCount: number;
  lastFailedAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  email: { type: String, required: true },
  ip: { type: String, required: true },
  failCount: { type: Number, default: 0 },
  lastFailedAt: { type: Date, default: Date.now },
});

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);
