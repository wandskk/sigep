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

export default function TurmaDetalhes({
  params,
}: {
  params: { turmaId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      fetchTurma();
    }
  }, [session, params.turmaId]);

  const fetchTurma = async () => {
    try {
      const response = await fetch(`/api/professor/turmas/${params.turmaId}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da turma");
      }
      const data = await response.json();
      setTurma(data);
    } catch (err) {
      setError("Erro ao carregar dados da turma");
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
                {turma.nome}
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-[#374151] mb-4">
                  Informações da Turma
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-[#6B7280]">Código</dt>
                    <dd className="mt-1 text-sm text-[#374151]">{turma.codigo}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-[#6B7280]">Turno</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E5E7EB] text-[#374151]">
                        {getTurnoLabel(turma.turno)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-[#6B7280]">Total de Alunos</dt>
                    <dd className="mt-1 text-sm text-[#374151]">{turma.totalAlunos}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-[#374151] mb-4">
                  Disciplinas
                </h3>
                <div className="space-y-2">
                  {turma.disciplinas.map((disciplina) => (
                    <div
                      key={disciplina.id}
                      className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#374151]">
                          {disciplina.nome}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {disciplina.codigo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-[#374151] mb-4">
                  Ações
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/professor/turmas/${turma.id}/chamada`}
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
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
                    Fazer Chamada
                  </Link>
                  <Link
                    href={`/professor/turmas/${turma.id}/notas`}
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#059669] hover:bg-[#047857] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669]"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
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
                    Lançar Notas
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 