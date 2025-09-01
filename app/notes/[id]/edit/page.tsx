"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { useNotes, useNoteById } from "@/features/notes/useNotes";

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateNote } = useNotes();

  const { data: note, isLoading, isError } = useNoteById(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNote.mutate(
      { id, data: { title, content } },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Loading note..." />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load note. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold mb-4">Edit Note</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              isRequired
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              isRequired
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                color="primary"
                isLoading={updateNote.isPending}
              >
                Update
              </Button>
              <Button
                variant="flat"
                onPress={() => router.push("/")}
                disabled={updateNote.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
