"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import NoteCard from "@/features/notes/NoteCard";
import NoteForm from "@/features/notes/NoteForm";
import { useNotes } from "@/features/notes/useNotes";

export default function NotesPage() {
  const { notes, isLoading, isError, deleteNote } = useNotes();

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      {/* Form Add Note */}
      <NoteForm />

      {/* Notes list */}
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner label="Loading notes..." />
        </div>
      ) : isError ? (
        <Card className="mt-4 text-center">
          <CardBody>⚠️ Failed to load notes.</CardBody>
        </Card>
      ) : notes && notes.length === 0 ? (
        <motion.div
          key="empty-state"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mt-4 text-center">
            <CardBody>No notes yet. Start by adding one ✨</CardBody>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence>
          {notes?.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDeleteAction={(id) => deleteNote.mutate(id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
