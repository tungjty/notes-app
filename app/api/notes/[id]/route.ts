import { NextResponse } from "next/server";
import Note from "@/models/Note";
import { connectDB } from "@/lib/mongoose";

// 📌 GET one note
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    console.log("📌 note ID:", id);

    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (err: unknown) {
    console.error("❌ GET by ID error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

// 📌 UPDATE note
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // 👇 giả lập delay N giây
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { id } = await context.params; // 📌 lấy id từ params
    const body = await req.json(); // 📌 data mới (title, content)
    // console.log("📌 Update ID:", id, "Body:", body);

    // throw new Error("❌ Failed to update note"); // 👈 giả lập update failed

    const updatedNote = await Note.findByIdAndUpdate(id, body, {
      new: true, // trả về document sau khi update
      runValidators: true,
    });

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note updated", note: updatedNote });
  } catch (err: unknown) {
    console.error("❌ PUT error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

// 📌 DELETE note
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // 👇 giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { id } = await context.params; // phải await params trước
    console.log("✅ params.id:", id);

    if (!id) {
      return NextResponse.json({ error: "Missing note id" }, { status: 400 });
    }

    // throw new Error("❌ Failed to delete note"); // 👈 giả lập delete failed

    const result = await Note.findByIdAndDelete(id);
    console.log("🗑  delete result:", result);

    if (!result) {
      return NextResponse.json(
        { error: "Note not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note deleted", deletedNote: result });
  } catch (error: unknown) {
    console.error("❌ Delete note error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
