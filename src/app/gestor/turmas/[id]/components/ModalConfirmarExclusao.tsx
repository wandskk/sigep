"use client";

import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/Button";

interface ModalConfirmarExclusaoProps {
  isOpen: boolean;
  onClose: () => void;
  disciplinaNome: string;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function ModalConfirmarExclusao({
  isOpen,
  onClose,
  disciplinaNome,
  onConfirm,
  isSubmitting,
}: ModalConfirmarExclusaoProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
          <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
            Confirmar Exclusão
          </Dialog.Title>

          <p className="mb-4 text-gray-600">
            Tem certeza que deseja remover a disciplina{" "}
            <span className="font-semibold">{disciplinaNome}</span> desta turma?
          </p>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Removendo..." : "Confirmar Exclusão"}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 