import { NextResponse } from "next/server";
import Note from "@/models/Note";
import { connectDB } from "@/lib/mongodb";

// 📌 GET all notes
export async function GET() {
  try {
    await connectDB();
    const notes = await Note.find({});
    return NextResponse.json(notes);
  } catch (err: unknown) {
    console.error("❌ GET error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

// 📌 CREATE new note
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const newNote = await Note.create(body);

    return NextResponse.json({ message: "Note created", note: newNote });
  } catch (err: unknown) {
    console.error("❌ POST error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
