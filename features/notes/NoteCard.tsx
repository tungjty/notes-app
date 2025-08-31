"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Note } from "@/lib/api";

type NoteCardProps = {
  note: Note;
  onDeleteAction: (id: string) => void;
};

export default function NoteCard({ note, onDeleteAction }: NoteCardProps) {
  return (
    <motion.div
      key={note._id}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{
        opacity: note.isDeleting ? 0.5 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.5, y: 30 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mt-4">
        <CardBody>
          <h2 className="font-bold text-lg">{note.title}</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
          <div className="flex gap-2 mt-3">
            <Link href={`/notes/${note._id}/edit`}>
              <Button
                color="secondary"
                variant="flat"
                className="w-32"
                isDisabled={note.isDeleting}
              >
                Edit
              </Button>
            </Link>
            <Button
              color="danger"
              variant="flat"
              className="w-32"
              onPress={() => onDeleteAction(note._id)}
              isLoading={note.isDeleting}
            >
              Delete
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
