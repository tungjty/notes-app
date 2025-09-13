// models/Session.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  sessionToken: string;
  userId: mongoose.Types.ObjectId;
  expires: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionToken: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    expires: Date,
  },
  { timestamps: true }
);

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
