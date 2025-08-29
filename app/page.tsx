"use client";

import { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch all notes
  async function fetchNotes() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
  }

  // Create new note
  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    fetchNotes();
  }

  // Delete note
  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📒 Notes App</h1>

      {/* Form add note */}
      <form onSubmit={addNote} className="mb-6 space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Note
        </button>
      </form>

      {/* Notes list */}
      <ul className="space-y-4">
        {notes.map((note) => (
          <li
            key={note._id}
            className="p-4 border rounded flex justify-between items-start"
          >
            <div>
              <h2 className="font-semibold">{note.title}</h2>
              <p className="text-sm">{note.content}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/notes/${note._id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </a>
              <button
                onClick={() => deleteNote(note._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
