"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Note {
  _id: string;
  title: string;
  content: string;
}

async function getNote(id: string): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`);
  return res.json();
}

async function updateNote(id: string, data: { title: string; content: string }) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function EditNotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", params.id],
    queryFn: () => getNote(params.id),
  });

  const mutationUpdate = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      updateNote(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/");
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Note</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutationUpdate.mutate({ title, content });
        }}
        className="space-y-2"
      >
        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
