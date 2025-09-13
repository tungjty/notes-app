import mongoose, { Schema, Document } from "mongoose";

export interface ISessionCSRF extends Document {
  sessionId: string; // định danh session (random)
  userId: mongoose.Types.ObjectId; // liên kết tới User
  csrfToken: string; // CSRF token cho session này (random)
  expiresAt: Date; // thời điểm hết hạn session
}

const SessionCSRFSchema = new Schema<ISessionCSRF>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    csrfToken: { type: String, required: true },
    // expiresAt với TTL index: 
    // 📌 Lưu ý: index: { expires: 0 } nghĩa là khi expiresAt < now, 
    // MongoDB TTL monitor (chạy mỗi 60s) sẽ tự xoá doc.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// Tránh lỗi hot reload khi dev
export default mongoose.models.SessionCSRF ||
  mongoose.model<ISessionCSRF>("SessionCSRF", SessionCSRFSchema);
