import { NextResponse } from "next/server";
import Note from "@/models/Note";
import { connectDB } from "@/lib/mongodb";

// 📌 GET one note
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    console.log("📌 noteÏ ID:", id);

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

    const { id } = await context.params; // 📌 lấy id từ params
    const body = await req.json(); // 📌 data mới (title, content)
    console.log("📌 Update ID:", id, "Body:", body);

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

    const { id } = await context.params; // phải await params trước
    console.log("✅ params.id:", id);

    if (!id) {
      return NextResponse.json({ error: "Missing note id" }, { status: 400 });
    }

    const result = await Note.findByIdAndDelete(id);
    console.log("🗑  delete result:", result);

    if (!result) {
      return NextResponse.json(
        { error: "Note not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note deleted", deletedNote: result });
  } catch (err: unknown) {
    let errorMessage = "Something went wrong";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
