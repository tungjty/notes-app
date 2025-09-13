// models/VerificationToken.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    identifier: String,
    token: { type: String, unique: true },
    expires: Date,
  },
  { timestamps: true }
);

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
