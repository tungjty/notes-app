import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true } // 👉 auto thêm createdAt & updatedAt
);

// Nếu model đã tồn tại thì dùng lại, tránh lỗi khi hot reload
export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
