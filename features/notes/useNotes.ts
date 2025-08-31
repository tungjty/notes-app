"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";
import {
  fetchNotes,
  getNoteByIdApi,
  addNoteApi,
  updateNoteApi,
  deleteNoteApi,
  type Note,
} from "@/lib/api";

// Fetch single note by id
export function useNoteById(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => getNoteByIdApi(id),
    enabled: !!id,
  });
}

export function useNotes() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);

  // Fetch all notes
  const {
    data: notes,
    isLoading,
    isError,
  } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  // Add note
  const addNote = useMutation({
    mutationFn: addNoteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
      titleRef.current?.focus();
      addToast({
        title: "Note added successfully",
        description: "Your note has been saved successfully.",
        color: "success",
      });
    },
    onError: () => {
      titleRef.current?.focus();
      addToast({
        title: "Add note failed",
        description: "Something went wrong while adding note.",
        color: "danger",
      });
    },
  });

  // Delete note
  const deleteNote = useMutation({
    mutationFn: deleteNoteApi,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const prevNotes = queryClient.getQueryData<Note[]>(["notes"]);
      queryClient.setQueryData(
        ["notes"],
        prevNotes?.map((note) =>
          note._id === id ? { ...note, isDeleting: true } : note
        )
      );
      return { prevNotes };
    },
    onSuccess: () => {
      addToast({
        title: "Note deleted 🗑️",
        description: "The note was deleted successfully.",
        color: "success",
      });
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevNotes) {
        queryClient.setQueryData(["notes"], ctx.prevNotes);
      }
      addToast({
        title: "Delete note failed",
        description: "Could not delete the note. Try again.",
        color: "danger",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Update note
  const updateNote = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title: string; content: string };
    }) => updateNoteApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      addToast({
        title: "Note updated ✏️",
        description: "Your note has been updated successfully.",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Update failed",
        description: "Something went wrong while updating note.",
        color: "danger",
      });
    },
  });

  return {
    // states
    notes,
    isLoading,
    isError,
    title,
    setTitle,
    content,
    setContent,
    titleRef,

    // actions
    addNote,
    deleteNote,
    updateNote,
  };
}
