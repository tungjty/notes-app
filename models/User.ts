// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  password?: string;   // hash
  currentRefreshTokenHash?: string, // hash refresh token hiện tại
}

const UserSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, unique: true, sparse: true },
    emailVerified: Date,
    image: String,
    password: String,
    currentRefreshTokenHash: String,
  },
  { timestamps: true }
);

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
