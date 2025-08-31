"use client";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Textarea,
} from "@heroui/react";
import { useNotes } from "@/features/notes/useNotes";

export default function NoteForm() {
  const { title, setTitle, content, setContent, titleRef, addNote } =
    useNotes();

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-brand">Notes App</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          isRequired
          label="Title"
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          isRequired
          className="size-md w-full"
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </CardBody>
      <CardFooter>
        <Button
          color="primary"
          className="w-32"
          onPress={() => addNote.mutate({ title, content })}
          isLoading={addNote.isPending}
          isDisabled={
            addNote.isPending || title.trim() === "" || content.trim() === ""
          }
        >
          + Add Note
        </Button>
      </CardFooter>
    </Card>
  );
}
