"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@headlessui/react";
import { PlusIcon, TrashIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loader } from "@/components/ui/Loader";

interface Turma {
  id: string;
  nome: string;
  turno: string;
  _count: {
    alunos: number;
    professores: number;
    disciplinas: number;
  };
}

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  turno: z.enum(["MATUTINO", "VESPERTINO", "NOTURNO"], {
    required_error: "Turno é obrigatório",
  }),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

interface TurmasContentProps {
  turmasIniciais: Turma[];
}

export function TurmasContent({ turmasIniciais }: TurmasContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const basePath = isAdmin ? "/admin" : "/gestor";
  const [turmas, setTurmas] = useState<Turma[]>(turmasIniciais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
  });

  const onSubmit = async (data: TurmaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api${basePath}/turmas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao criar turma");
      }

      const novaTurma = await response.json();
      setSuccess("Turma criada com sucesso!");
      setIsModalOpen(false);
      reset();
      setTurmas(prev => [...prev, novaTurma]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar turma");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (turma: Turma) => {
    setTurmaToDelete(turma);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!turmaToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api${basePath}/turmas/${turmaToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao excluir turma");
      }

      setSuccess("Turma excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setTurmaToDelete(null);
      setTurmas(prev => prev.filter(t => t.id !== turmaToDelete.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir turma");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader 
          size="lg" 
          variant="primary" 
          text="Carregando turmas..." 
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#374151]">Turmas</h1>
        <Button
          variant="primary"
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Adicionar Turma
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

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nome da Turma
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Turno
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Alunos
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Professores
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Disciplinas
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
            {turmas.map((turma) => (
              <tr key={turma.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {turma.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {turma.turno === "MATUTINO" && "Matutino"}
                    {turma.turno === "VESPERTINO" && "Vespertino"}
                    {turma.turno === "NOTURNO" && "Noturno"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {turma._count.alunos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {turma._count.professores}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {turma._count.disciplinas}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end items-center">
                  <EyeIcon
                    className="h-5 w-5 text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => { router.push(`${basePath}/turmas/${turma.id}`); }}
                    title="Visualizar"
                  />
                  <PencilIcon
                    className="h-5 w-5 text-yellow-500 cursor-pointer hover:text-yellow-700"
                    onClick={() => { router.push(`${basePath}/turmas/${turma.id}/editar`); }}
                    title="Editar"
                  />
                  <TrashIcon
                    className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800"
                    onClick={() => { handleDeleteClick(turma); }}
                    title="Excluir"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar Turma */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Nova Turma
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Nome da Turma
                </label>
                <Input
                  error={errors.nome?.message}
                  {...register("nome")}
                  placeholder="Digite o nome da turma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Turno
                </label>
                <Controller
                  name="turno"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="MATUTINO">Matutino</option>
                      <option value="VESPERTINO">Vespertino</option>
                      <option value="NOTURNO">Noturno</option>
                    </Select>
                  )}
                />
                {errors.turno?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.turno.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Turma"}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Confirmar Exclusão
            </Dialog.Title>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir a turma{" "}
                <span className="font-medium text-gray-900">
                  {turmaToDelete?.nome}
                </span>
                ?
              </p>
              <p className="text-sm text-red-500 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir Turma"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 