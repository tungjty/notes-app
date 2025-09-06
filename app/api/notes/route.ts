import { NextResponse } from "next/server";
import Note from "@/models/Note";
import { connectDB } from "@/lib/mongoose";

// 📌 GET all notes sorted by createdAt DESC
export async function GET() {
  try {
    await connectDB();
    const notes = await Note.find({}).sort({ createdAt: -1 }); // _id: -1
    return NextResponse.json(notes);
  } catch (err: unknown) {
    console.error("❌ GET error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

// 📌 CREATE new note
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // 👇 giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 👇 giả lập create note failedÏ
    // throw new Error("❌ Failed to add note");

    const newNote = await Note.create(body);

    return NextResponse.json({ message: "Note created", note: newNote });
  } catch (error: unknown) {
    console.error("❌ CREATE note error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
