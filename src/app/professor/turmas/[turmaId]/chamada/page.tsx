"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Turno } from "@prisma/client";
import Link from "next/link";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  presente: boolean;
}

interface Turma {
  id: string;
  nome: string;
  codigo?: string;
  turno?: Turno;
  escola: {
    id: string;
    nome: string;
  };
  alunos?: Aluno[];
}

interface ApiResponse {
  turma: Turma;
  alunos: Aluno[];
}

interface FormData {
  data: string;
  presencas: {
    alunoId: string;
    presente: boolean;
  }[];
}

// Componente da Modal de Confirmação
function ModalConfirmacao({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full">
        <div className="flex items-center justify-center mb-4 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Chamada Registrada!</h3>
        <p className="text-center text-gray-600 mb-6">A chamada foi registrada com sucesso.</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
          >
            Ver Lista de Chamadas
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChamadaTurma({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      data: new Date().toISOString().split("T")[0],
      presencas: []
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "presencas"
  });

  const dataChamada = watch("data");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "PROFESSOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "PROFESSOR") {
      fetchTurma();
    }
  }, [session, resolvedParams.turmaId, dataChamada]);

  const fetchTurma = async () => {
    try {
      const response = await fetch(`/api/professor/turmas/${resolvedParams.turmaId}/chamada?data=${dataChamada}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da turma");
      }
      const data = await response.json() as ApiResponse;
      
      // Combinando os dados da turma com os alunos
      const turmaCompleta = {
        ...data.turma,
        alunos: data.alunos
      };
      
      setTurma(turmaCompleta);
      
      // Atualiza os campos do formulário com os dados da turma
      setValue("presencas", data.alunos.map((aluno: Aluno) => ({
        alunoId: aluno.id,
        presente: aluno.presente
      })));
    } catch (err) {
      setError("Erro ao carregar dados da turma");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!turma) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/professor/turmas/${resolvedParams.turmaId}/chamada`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar chamada");
      }

      setShowConfirmacao(true);
      setSaving(false);
    } catch (err) {
      setError("Erro ao salvar chamada");
      console.error(err);
      setSaving(false);
    }
  };

  const handleConfirmModal = () => {
    setShowConfirmacao(false);
    router.push(`/professor/turmas/${resolvedParams.turmaId}/chamadas`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "PROFESSOR" || !turma) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#374151]">
                Fazer Chamada
              </h1>
              {turma && (
                <p className="mt-1 text-lg font-medium text-[#4B5563]">
                  Turma: {turma.nome}{turma.codigo ? ` - ${turma.codigo}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Link
                href={`/professor/turmas/${resolvedParams.turmaId}/chamadas`}
                className="inline-flex items-center px-4 py-2 border border-[#E5E7EB] rounded-md shadow-sm text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
              >
                Ver Chamadas
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-[#E5E7EB] rounded-md shadow-sm text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
              >
                Voltar
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-[#374151]">
                    Data:
                    <input
                      type="date"
                      {...register("data", { required: "Data é obrigatória" })}
                      className="ml-2 px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={fetchTurma}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
                  >
                    Carregar
                  </button>
                </div>
                {errors.data && (
                  <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Matrícula
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Nome
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Presença
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {fields.map((field, index) => {
                      const aluno = turma.alunos?.[index];
                      if (!aluno) return null;
                      return (
                        <tr
                          key={field.id}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                            {aluno.matricula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                            {aluno.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              {...register(`presencas.${index}.presente`)}
                              className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-[#E5E7EB] rounded"
                            />
                            <input
                              type="hidden"
                              {...register(`presencas.${index}.alunoId`)}
                              value={aluno.id}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[#E5E7EB]">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#059669] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      "Salvar Chamada"
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </form>

          <ModalConfirmacao 
            isOpen={showConfirmacao} 
            onClose={() => setShowConfirmacao(false)} 
            onConfirm={handleConfirmModal} 
          />
        </div>
      </div>
    </div>
  );
} 