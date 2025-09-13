import mongoose, { Schema, Document } from "mongoose";

export interface IUserSession extends Document {
  userId: string;
  jtiHash: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  expiresAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: { type: String, required: true },
  jtiHash: { type: String, required: true },
  userAgent: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL index: Mongo sẽ tự xoá session khi expiresAt < now
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.UserSession ||
  mongoose.model<IUserSession>("UserSession", UserSessionSchema);
