"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import { Turno } from "@prisma/client";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  presente: boolean;
}

interface Chamada {
  data: string;
  totalAlunos: number;
  presentes: number;
  ausentes: number;
  alunos: Aluno[];
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
}

export default function ListagemChamadas({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chamadas, setChamadas] = useState<Chamada[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [turma, setTurma] = useState<Turma | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "PROFESSOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "PROFESSOR") {
      fetchTurmaInfo();
      fetchChamadas();
    }
  }, [session, resolvedParams.turmaId, dataInicio, dataFim]);

  const fetchTurmaInfo = async () => {
    try {
      const response = await fetch(`/api/professor/turmas/${resolvedParams.turmaId}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da turma");
      }
      const data = await response.json();
      setTurma(data);
    } catch (err) {
      console.error("Erro ao carregar informações da turma:", err);
    }
  };

  const fetchChamadas = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (dataInicio) queryParams.append("dataInicio", dataInicio);
      if (dataFim) queryParams.append("dataFim", dataFim);

      const response = await fetch(
        `/api/professor/turmas/${resolvedParams.turmaId}/chamadas?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar chamadas");
      }
      const data = await response.json();
      setChamadas(data);
    } catch (err) {
      setError("Erro ao carregar chamadas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "PROFESSOR") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-[#E5E7EB] rounded-md shadow-sm text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
            >
              Voltar
            </button>
          </div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#374151]">
                Registro de Chamadas
              </h1>
              {turma && (
                <p className="mt-1 text-lg font-medium text-[#4B5563]">
                  Turma: {turma.nome} - {turma.codigo}
                </p>
              )}
            </div>
            <div>
              <Link
                href={`/professor/turmas/${resolvedParams.turmaId}/chamada`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
              >
                Nova Chamada
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-[#374151] mb-4">
                Filtros
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dataInicio"
                    className="block text-sm font-medium text-[#374151]"
                  >
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    id="dataInicio"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="mt-1 block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A] sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dataFim"
                    className="block text-sm font-medium text-[#374151]"
                  >
                    Data Final
                  </label>
                  <input
                    type="date"
                    id="dataFim"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="mt-1 block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A] sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {chamadas.length === 0 ? (
            <Card>
              <div className="p-6 text-center text-[#6B7280]">
                Nenhuma chamada encontrada no período selecionado.
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {chamadas.map((chamada) => (
                <Card key={chamada.data}>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#374151]">
                        Chamada do dia {formatarData(chamada.data)}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-[#059669]">
                          {chamada.presentes} presentes
                        </span>
                        <span className="text-[#DC2626]">
                          {chamada.ausentes} ausentes
                        </span>
                        <span className="text-[#6B7280]">
                          Total: {chamada.totalAlunos}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E5E7EB]">
                        <thead className="bg-[#F9FAFB]">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                            >
                              Nome do Aluno
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                            >
                              Situação
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#E5E7EB]">
                          {chamada.alunos && chamada.alunos.map((aluno) => (
                            <tr key={aluno.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#374151]">
                                {aluno.nome}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    aluno.presente
                                      ? "bg-[#D1FAE5] text-[#059669]"
                                      : "bg-[#FEE2E2] text-[#DC2626]"
                                  }`}
                                >
                                  {aluno.presente ? "Presente" : "Ausente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 