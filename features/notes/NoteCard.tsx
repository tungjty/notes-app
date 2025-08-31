"use client";

import {
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem as RawDropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import type { Note } from "@/lib/api";

type NoteCardProps = {
  note: Note;
  onDeleteAction: (id: string) => void;
};

// Workaround: cast the generic DropdownItem to a React component type so TS accepts it in JSX
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DropdownItem = RawDropdownItem as unknown as React.ComponentType<any>;

export default function NoteCard({ note, onDeleteAction }: NoteCardProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleConfirmDelete = () => {
    onDeleteAction(note._id);
    onClose();
  };

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
      <Card className="mt-4 relative">
        <CardBody>
          {/* Title & menu icon */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-lg">{note.title}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
            </div>

            {/* Dropdown menu */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  disabled={note.isDeleting}
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Note actions">
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/notes/${note._id}/edit`}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={onOpen}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardBody>
      </Card>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold">
                Confirm Delete
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete <b>{note.title}</b>? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleConfirmDelete}
                  isLoading={note.isDeleting}
                >
                  Yes, Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
