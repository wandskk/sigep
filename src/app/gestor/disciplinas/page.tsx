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
import { Card } from "@/components/ui/Card";

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
  const [disciplinaToDelete, setDisciplinaToDelete] = useState<Disciplina | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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

  const onSubmit = async (data: DisciplinaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/gestor/disciplinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao criar disciplina");
      }

      setSuccess("Disciplina criada com sucesso!");
      reset();
      setShowAddForm(false);
      fetchDisciplinas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    reset();
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
            {!showAddForm && (
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Adicionar disciplina
              </Button>
            )}
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

          {showAddForm && (
            <Card className="mb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      label="Nova Disciplina"
                      error={errors.nome?.message}
                      {...register("nome")}
                      placeholder="Digite o nome da disciplina"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelAdd}
                      disabled={isSubmitting}
                      className="h-10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="h-10"
                    >
                      {isSubmitting ? "Adicionando..." : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Código
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
                    <tr key={disciplina.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {disciplina.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {disciplina.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDisciplinaToDelete(disciplina);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={isSubmitting}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {disciplinas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Nenhuma disciplina cadastrada
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de Confirmar Exclusão */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsDeleteModalOpen(false);
            setDisciplinaToDelete(null);
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
              Tem certeza que deseja excluir a disciplina{" "}
              <span className="font-semibold">{disciplinaToDelete?.nome}</span>?
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDisciplinaToDelete(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
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
  );
}
