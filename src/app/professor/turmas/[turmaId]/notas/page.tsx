"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Turno } from "@prisma/client";

type Bimestre = "PRIMEIRO" | "SEGUNDO" | "TERCEIRO" | "QUARTO";

interface Nota {
  id?: string;
  valor: number;
  tipo: "PROVA" | "TRABALHO" | "EXERCICIO";
  bimestre: Bimestre;
  data: string;
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  notas: Nota[];
}

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: Turno;
  escola: {
    id: string;
    nome: string;
  };
  alunos: Aluno[];
  disciplinas: Disciplina[];
}

// Componente que exibe uma visão geral das notas de um aluno por bimestre
function NotasResumo({ aluno, disciplinaId }: { aluno: Aluno; disciplinaId: string }) {
  const bimestres: Bimestre[] = ["PRIMEIRO", "SEGUNDO", "TERCEIRO", "QUARTO"];
  
  const getNotaBimestre = (bimestre: Bimestre) => {
    const notaBimestre = aluno.notas.find(n => n.bimestre === bimestre);
    return notaBimestre?.valor !== undefined ? notaBimestre.valor.toFixed(1) : "-";
  };

  return (
    <div className="flex space-x-2 text-xs">
      {bimestres.map((bimestre) => (
        <div 
          key={bimestre} 
          className="px-2 py-1 bg-gray-100 rounded"
          title={`${getBimestreLabel(bimestre)}`}
        >
          <span className="font-medium">{bimestre.substring(0, 1)}º:</span> {getNotaBimestre(bimestre)}
        </div>
      ))}
    </div>
  );
}

// Função para obter o label do bimestre
function getBimestreLabel(bimestre: Bimestre): string {
  switch (bimestre) {
    case "PRIMEIRO": return "1º Bimestre";
    case "SEGUNDO": return "2º Bimestre";
    case "TERCEIRO": return "3º Bimestre";
    case "QUARTO": return "4º Bimestre";
  }
}

export default function NotasTurma({
  params,
}: {
  params: { turmaId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<Nota["tipo"]>("PROVA");
  const [selectedBimestre, setSelectedBimestre] = useState<Bimestre>("PRIMEIRO");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  }, [session, params.turmaId]);

  const fetchTurma = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/professor/turmas/${params.turmaId}/notas`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da turma");
      }
      const turmaData = await response.json();
      setTurma(turmaData);
      if (turmaData.disciplinas.length > 0) {
        setSelectedDisciplina(turmaData.disciplinas[0].id);
      }
    } catch (err) {
      setError("Erro ao carregar dados da turma");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotaChange = (alunoId: string, valor: number) => {
    if (!turma) return;

    setTurma({
      ...turma,
      alunos: turma.alunos.map((aluno) =>
        aluno.id === alunoId
          ? {
              ...aluno,
              notas: [
                ...aluno.notas.filter(
                  (n) =>
                    n.tipo !== selectedTipo ||
                    n.bimestre !== selectedBimestre ||
                    n.data !== data ||
                    n.id !== undefined
                ),
                { valor, tipo: selectedTipo, bimestre: selectedBimestre, data },
              ],
            }
          : aluno
      ),
    });
  };

  const handleSubmit = async () => {
    if (!turma || !selectedDisciplina) return;

    setSaving(true);
    setSuccessMessage(null);
    setError(null);
    
    try {
      const response = await fetch(`/api/professor/turmas/${params.turmaId}/notas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disciplinaId: selectedDisciplina,
          data,
          tipo: selectedTipo,
          bimestre: selectedBimestre,
          notas: turma.alunos.map((aluno) => ({
            alunoId: aluno.id,
            valor: aluno.notas.find(
              (n) => n.tipo === selectedTipo && n.bimestre === selectedBimestre && n.data === data
            )?.valor || 0,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar notas");
      }

      // Mostrar mensagem de sucesso
      setSuccessMessage(`Notas do ${getBimestreLabel(selectedBimestre)} registradas com sucesso!`);
      // Recarregar dados para atualizar o estado
      await fetchTurma();
    } catch (err) {
      setError("Erro ao salvar notas");
      console.error(err);
    } finally {
      setSaving(false);
    }
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
                Notas - {turma.nome}
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                {turma.escola.nome} - {turma.codigo}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-[#E5E7EB] rounded-md shadow-sm text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
            >
              Voltar
            </button>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="mb-6">
              {successMessage}
            </Alert>
          )}

          <Card className="mb-6">
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Disciplina
                  </label>
                  <select
                    value={selectedDisciplina}
                    onChange={(e) => setSelectedDisciplina(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#E5E7EB] focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm rounded-md"
                  >
                    {turma.disciplinas.map((disciplina) => (
                      <option key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Bimestre
                  </label>
                  <select
                    value={selectedBimestre}
                    onChange={(e) => setSelectedBimestre(e.target.value as Bimestre)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#E5E7EB] focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm rounded-md"
                  >
                    <option value="PRIMEIRO">1º Bimestre</option>
                    <option value="SEGUNDO">2º Bimestre</option>
                    <option value="TERCEIRO">3º Bimestre</option>
                    <option value="QUARTO">4º Bimestre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Tipo
                  </label>
                  <select
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value as Nota["tipo"])}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#E5E7EB] focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm rounded-md"
                  >
                    <option value="PROVA">Prova</option>
                    <option value="TRABALHO">Trabalho</option>
                    <option value="EXERCICIO">Exercício</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">
                    Data
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchTurma}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
                  >
                    Carregar
                  </button>
                </div>
              </div>
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
                      Resumo das Notas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-[#374151] uppercase tracking-wider"
                    >
                      Nota ({getBimestreLabel(selectedBimestre)})
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {turma.alunos.map((aluno) => {
                    const notaAtual = aluno.notas.find(
                      (n) => n.tipo === selectedTipo && n.bimestre === selectedBimestre && n.data === data
                    );
                    return (
                      <tr
                        key={aluno.id}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          {aluno.matricula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          {aluno.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <NotasResumo aluno={aluno} disciplinaId={selectedDisciplina} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={notaAtual?.valor || ""}
                            onChange={(e) =>
                              handleNotaChange(
                                aluno.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
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
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#059669] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    "Salvar Notas"
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 