"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@headlessui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

const disciplinaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

type DisciplinaFormData = z.infer<typeof disciplinaSchema>;

type ModalMode = "create" | "edit";

export default function DisciplinasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [disciplinaToDelete, setDisciplinaToDelete] =
    useState<Disciplina | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disciplinaToEdit, setDisciplinaToEdit] = useState<Disciplina | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DisciplinaFormData>({
    resolver: zodResolver(disciplinaSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "GESTOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "GESTOR") {
      fetchDisciplinas();
    }
  }, [session]);

  const fetchDisciplinas = async () => {
    try {
      const response = await fetch("/api/gestor/disciplinas");
      if (!response.ok) {
        throw new Error("Erro ao carregar disciplinas");
      }
      const data = await response.json();
      setDisciplinas(data);
    } catch (err) {
      setError("Não foi possível carregar as disciplinas");
      console.error("Erro ao buscar disciplinas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!disciplinaToDelete) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `/api/gestor/disciplinas/${disciplinaToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao excluir disciplina");
      }

      setSuccess("Disciplina excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setDisciplinaToDelete(null);
      fetchDisciplinas();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir disciplina"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mode: ModalMode, disciplina?: Disciplina) => {
    setModalMode(mode);
    if (mode === "edit" && disciplina) {
      setDisciplinaToEdit(disciplina);
      setValue("nome", disciplina.nome);
    } else {
      setDisciplinaToEdit(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setDisciplinaToEdit(null);
      reset();
    }
  };

  const onSubmit = async (data: DisciplinaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const url =
        modalMode === "edit"
          ? `/api/gestor/disciplinas/${disciplinaToEdit?.id}`
          : "/api/gestor/disciplinas";

      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData ||
            `Erro ao ${modalMode === "edit" ? "editar" : "criar"} disciplina`
        );
      }

      setSuccess(
        `Disciplina ${modalMode === "edit" ? "editada" : "criada"} com sucesso!`
      );
      closeModal();
      fetchDisciplinas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao ${modalMode === "edit" ? "editar" : "criar"} disciplina`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "GESTOR") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">Disciplinas</h1>
            <Button
              variant="primary"
              onClick={() => openModal("create")}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Adicionar disciplina
            </Button>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              {success}
            </Alert>
          )}

          {disciplinas.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disciplinas.map((disciplina) => (
                    <tr key={disciplina.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {disciplina.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openModal("edit", disciplina)}
                            className="flex items-center gap-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => {
                              setDisciplinaToDelete(disciplina);
                              setIsDeleteModalOpen(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de Criação/Edição */}
          <Dialog
            open={isModalOpen}
            onClose={closeModal}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
                <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
                  {modalMode === "edit"
                    ? "Editar Disciplina"
                    : "Nova Disciplina"}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Nome da Disciplina"
                    error={errors.nome?.message}
                    {...register("nome")}
                  />

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={closeModal}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? modalMode === "edit"
                          ? "Editando..."
                          : "Criando..."
                        : modalMode === "edit"
                        ? "Salvar Alterações"
                        : "Criar Disciplina"}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>

          {/* Modal de Confirmação de Exclusão */}
          <Dialog
            open={isDeleteModalOpen}
            onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
                <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
                  Confirmar Exclusão
                </Dialog.Title>

                <p className="text-[#6B7280] mb-6">
                  Tem certeza que deseja excluir a disciplina "
                  {disciplinaToDelete?.nome}"? Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="error"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Excluindo..." : "Excluir Disciplina"}
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
