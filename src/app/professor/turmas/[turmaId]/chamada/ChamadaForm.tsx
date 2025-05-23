"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
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

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo?: string;
  turno?: Turno;
  escola: {
    id: string;
    name: string;
  };
  alunos?: Aluno[];
  disciplinas?: Disciplina[];
}

interface FormData {
  data: string;
  disciplinaId: string;
  presencas: {
    alunoId: string;
    presente: boolean;
  }[];
}

interface ChamadaFormProps {
  turma: Turma;
  disciplinas: Disciplina[];
  turmaId: string;
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

export default function ChamadaForm({ turma, disciplinas, turmaId }: ChamadaFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [showChamada, setShowChamada] = useState(false);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      data: new Date().toISOString().split("T")[0],
      disciplinaId: "",
      presencas: []
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "presencas"
  });

  const dataChamada = watch("data");
  const disciplinaId = watch("disciplinaId");

  // Função para alternar a presença do aluno
  const togglePresenca = (index: number) => {
    const currentValue = watch(`presencas.${index}.presente`);
    setValue(`presencas.${index}.presente`, !currentValue);
  };

  // Atualiza disciplinaId no form ao selecionar
  useEffect(() => {
    setValue("disciplinaId", selectedDisciplina);
    if (selectedDisciplina) {
      fetchTurma();
    } else {
      // Reset para os valores iniciais quando não há disciplina selecionada
      setValue("presencas", turma.alunos?.map(aluno => ({
        alunoId: aluno.id,
        presente: false
      })) || []);
    }
  }, [selectedDisciplina, setValue, turma.alunos]);

  const fetchTurma = async () => {
    if (!disciplinaId) return;
    try {
      const response = await fetch(`/api/professor/turmas/${turmaId}/chamada?data=${dataChamada}&disciplinaId=${disciplinaId}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da turma");
      }
      const data = await response.json();
      setValue("presencas", data.alunos.map((aluno: Aluno) => ({
        alunoId: aluno.id,
        presente: aluno.presente
      })));
      setShowChamada(true);
    } catch (err) {
      setError("Erro ao carregar dados da turma");
      console.error(err);
    }
  };

  // Reset do formulário quando mudar disciplina ou data
  useEffect(() => {
    setShowChamada(false);
    setValue("presencas", []);
  }, [selectedDisciplina, dataChamada, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!data.disciplinaId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/professor/turmas/${turmaId}/chamada`, {
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
    } catch (err) {
      setError("Erro ao salvar chamada");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmModal = () => {
    setShowConfirmacao(false);
    router.push(`/professor/turmas/${turmaId}/chamadas`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Fazer Chamada
              </h1>
              <div className="mt-2 flex flex-col sm:flex-row gap-2 text-gray-600">
                <p className="text-lg">
                  Turma: <span className="font-semibold">{turma.nome}</span>
                  {turma.codigo && <span className="ml-2 text-gray-500">({turma.codigo})</span>}
                </p>
                <p className="text-lg">
                  Escola: <span className="font-semibold">{turma.escola.name}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/professor/turmas/${turmaId}/chamadas`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Ver Chamadas
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Voltar
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Seleção de disciplina e data */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="px-5 py-4">
              <div className="flex flex-col sm:flex-row items-end justify-end gap-4">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="w-full sm:w-64 relative group">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 group-focus-within:text-blue-600 transition-colors">
                      Disciplina
                    </label>
                    <select
                      value={selectedDisciplina}
                      onChange={e => setSelectedDisciplina(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 hover:border-gray-200"
                      required
                    >
                      <option value="">Selecione uma disciplina</option>
                      {disciplinas.map((disciplina) => (
                        <option key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome} ({disciplina.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-40 relative group">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 group-focus-within:text-blue-600 transition-colors">
                      Data
                    </label>
                    <input
                      type="date"
                      {...register("data", { required: "Data é obrigatória" })}
                      className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 hover:border-gray-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchTurma}
                    disabled={!selectedDisciplina || !dataChamada}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {selectedDisciplina && dataChamada ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Iniciar Chamada
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Selecione os campos
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {errors.data && (
                <div className="flex justify-end mt-2">
                  <p className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.data.message}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {showChamada && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="shadow-lg border-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nome do Aluno
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Presente
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fields.map((field, index) => {
                        const aluno = turma.alunos?.[index];
                        if (!aluno) return null;
                        const isPresente = watch(`presencas.${index}.presente`);
                        return (
                          <tr
                            key={field.id}
                            className={`transition-colors cursor-pointer ${
                              !isPresente 
                                ? 'bg-red-50 hover:bg-red-100' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setValue(`presencas.${index}.presente`, !isPresente);
                            }}
                          >
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              !isPresente ? 'text-red-700 font-medium' : 'text-gray-900'
                            }`}>
                              {aluno.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <label 
                                className="relative inline-flex items-center cursor-pointer justify-end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setValue(`presencas.${index}.presente`, !isPresente);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isPresente}
                                  readOnly
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                  !isPresente 
                                    ? 'bg-red-200 peer-checked:bg-red-600' 
                                    : 'bg-gray-200 peer-checked:bg-blue-600'
                                }`}></div>
                              </label>
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

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total de alunos: <span className="font-medium">{fields.length}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Salvar Chamada
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </form>
          )}

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