export type Note = {
  _id: string;
  title: string;
  content: string;
  isDeleting?: boolean;
};

// Fetch Notes
export async function fetchNotes(): Promise<Note[]> {
  const isMock = false; // bật/tắt mock ở đây
  if (isMock) {
    return new Promise<Note[]>((resolve) =>
      setTimeout(() => resolve([]), 1000)
    );
  }
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// Add Note
export async function addNoteApi(newNote: Partial<Note>) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newNote),
  });
  if (!res.ok) throw new Error("Failed to add note");
  return res.json();
}

// get 1 note
export async function getNoteByIdApi(id: string): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

// update note
export async function updateNoteApi(
  id: string,
  updated: { title: string; content: string }
): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// Delete Note
export async function deleteNoteApi(id: string) {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}
