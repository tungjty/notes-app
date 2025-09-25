"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import NoteCard from "@/features/notes/NoteCard";
import NoteForm from "@/features/notes/NoteForm";
import { useNotes } from "@/features/notes/useNotes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotesPage() {
  const { notes, isLoading, isError, deleteNote } = useNotes();
    const router = useRouter();
  

  useEffect(() => {
      const ac = new AbortController();
  
      async function load() {
        try {
          const res = await fetch("/api/auth/check-token", {
            method: "GET",
            credentials: "include", // bắt buộc để gửi cookie HttpOnly
            cache: "no-store", // không dùng cache cũ
            signal: ac.signal,
          });
  
          if (res.status === 401) {
            console.log("⚠️ kết quả trả về là status === 401");
            // session invalid / expired -> redirect to login with reason + callback
            const callback = encodeURIComponent(window.location.pathname + window.location.search);
            router.replace(`/login/httpOnly/cookie?reason=session_expired&callback_url=${callback}`);
            return;
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return; // unmounted
          console.error("Fetch notes failed:", err);
        }
      }
  
      load();
  
      return () => {
        ac.abort();
      };
    }, [router]);

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
