"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Turno } from "@prisma/client";
import Link from "next/link";

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

interface Escola {
  id: string;
  nome: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: Turno;
  escola: Escola;
  totalAlunos: number;
  disciplinas: Disciplina[];
}

export default function TurmasProfessor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "PROFESSOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "PROFESSOR") {
      fetchTurmas();
    }
  }, [session]);

  const fetchTurmas = async () => {
    try {
      const response = await fetch("/api/professor/turmas");
      if (!response.ok) {
        throw new Error("Erro ao carregar turmas");
      }
      const data = await response.json();
      setTurmas(data);
    } catch (err) {
      setError("Erro ao carregar turmas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTurnoLabel = (turno: Turno) => {
    switch (turno) {
      case "MATUTINO":
        return "Matutino";
      case "VESPERTINO":
        return "Vespertino";
      case "NOTURNO":
        return "Noturno";
      default:
        return turno;
    }
  };

  const filteredTurmas = turmas.filter((turma) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(searchLower) ||
      turma.codigo.toLowerCase().includes(searchLower) ||
      turma.escola.nome.toLowerCase().includes(searchLower) ||
      turma.disciplinas.some(
        (d) =>
          d.nome.toLowerCase().includes(searchLower) ||
          d.codigo.toLowerCase().includes(searchLower)
      )
    );
  });

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">
              Minhas Turmas
            </h1>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Card className="mb-6">
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por turma, código, escola ou disciplina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          {turmas.length === 0 ? (
            <Card>
              <div className="p-6 text-center text-[#6B7280]">
                Você não possui turmas atribuídas.
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Turma
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Escola
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Turno
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Alunos
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Disciplinas
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider"
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {filteredTurmas.map((turma) => (
                      <tr
                        key={turma.id}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#374151]">
                            {turma.nome}
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            {turma.codigo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#374151]">
                            {turma.escola.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E5E7EB] text-[#374151]">
                            {getTurnoLabel(turma.turno)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          {turma.totalAlunos}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {turma.disciplinas.map((disciplina) => (
                              <span
                                key={disciplina.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#F3F4F6] text-[#374151]"
                                title={disciplina.codigo}
                              >
                                {disciplina.nome}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/professor/turmas/${turma.id}/chamada`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition-colors"
                            >
                              <svg
                                className="h-4 w-4 mr-1.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                              </svg>
                              Chamada
                            </Link>
                            <Link
                              href={`/professor/turmas/${turma.id}/notas`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#059669] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669] transition-colors"
                            >
                              <svg
                                className="h-4 w-4 mr-1.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Notas
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTurmas.length === 0 && (
                <div className="p-6 text-center text-[#6B7280]">
                  Nenhuma turma encontrada com os filtros aplicados.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 