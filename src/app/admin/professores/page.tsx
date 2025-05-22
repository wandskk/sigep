"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@headlessui/react";
import { PencilIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";

interface Escola {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  escola?: {
    id: string;
    name: string;
  } | null;
}

const escolaSchema = z.object({
  escolaId: z.string().min(1, "Selecione uma escola"),
});

type EscolaFormData = z.infer<typeof escolaSchema>;

export default function ProfessoresAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchProfessores();
      fetchEscolas();
    }
  }, [status, session, router]);

  const fetchProfessores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/professores");
      if (!response.ok) {
        throw new Error("Erro ao carregar professores");
      }
      const data = await response.json();
      setProfessores(data);
    } catch (err) {
      setError("Não foi possível carregar os professores");
      console.error("Erro ao buscar professores:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEscolas = async () => {
    try {
      const response = await fetch("/api/admin/schools");
      if (!response.ok) {
        throw new Error("Erro ao carregar escolas");
      }
      const data = await response.json();
      setEscolas(data);
    } catch (err) {
      setError("Não foi possível carregar as escolas");
      console.error("Erro ao buscar escolas:", err);
    }
  };

  const openModal = (professor: Professor) => {
    setProfessorSelecionado(professor);
    setValue("escolaId", professor.escola?.id || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setProfessorSelecionado(null);
      reset();
    }
  };

  const onSubmit = async (data: EscolaFormData) => {
    if (!professorSelecionado) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `/api/admin/professores/${professorSelecionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao atualizar escola do professor");
      }

      setSuccess("Escola do professor atualizada com sucesso!");
      closeModal();
      fetchProfessores();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar escola do professor"
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

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">Gerenciar Professores</h1>
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

          {professores.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Nenhum professor encontrado.
              </p>
            </div>
          ) : (
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Escola
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
                  {professores.map((professor) => (
                    <tr key={professor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {professor.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professor.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professor.escola?.name || "Sem escola"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal(professor)}
                        >
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          Alterar Escola
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Alterar Escola */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Alterar Escola do Professor
            </Dialog.Title>

            {professorSelecionado && (
              <div className="mb-4 bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700">Professor:</p>
                <p className="text-base">{professorSelecionado.user.name}</p>
                <p className="text-sm text-gray-500 mt-1">{professorSelecionado.user.email}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="escolaId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Escola
                </label>
                <select
                  id="escolaId"
                  {...register("escolaId")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.escolaId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Selecione uma escola</option>
                  {escolas.map((escola) => (
                    <option key={escola.id} value={escola.id}>
                      {escola.name}
                    </option>
                  ))}
                </select>
                {errors.escolaId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.escolaId.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 