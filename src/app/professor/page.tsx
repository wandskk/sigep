"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escola: {
    id: string;
    nome: string;
  };
  totalAlunos: number;
  disciplinas: Array<{
    id: string;
    nome: string;
    codigo: string;
  }>;
}

export default function ProfessorDashboard() {
  const { data: session } = useSession();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await fetch("/api/professor/turmas");
        if (!response.ok) {
          throw new Error("Erro ao carregar turmas");
        }
        const data = await response.json();
        setTurmas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar turmas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurmas();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E3A8A]">
          Bem-vindo(a), {session?.user?.name}
        </h1>
        <p className="mt-2 text-[#374151]/70">
          Gerencie suas turmas, notas e chamadas
        </p>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/professor/turmas"
          className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#1E3A8A] transition-all cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
            Minhas Turmas
          </h2>
          <p className="text-[#374151]/70 mb-4">
            Visualize e gerencie suas turmas ativas
          </p>
          <div className="text-sm text-[#1E3A8A] font-medium">
            Ver turmas &rarr;
          </div>
        </Link>

        <Link
          href="/professor/notas"
          className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#1E3A8A] transition-all cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
            Lançamento de Notas
          </h2>
          <p className="text-[#374151]/70 mb-4">
            Registre e atualize as notas dos alunos
          </p>
          <div className="text-sm text-[#1E3A8A] font-medium">
            Lançar notas &rarr;
          </div>
        </Link>

        <Link
          href="/professor/turmas"
          className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#1E3A8A] transition-all cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
            Chamada
          </h2>
          <p className="text-[#374151]/70 mb-4">
            Registre a presença dos alunos
          </p>
          <div className="text-sm text-[#1E3A8A] font-medium">
            Ver turmas &rarr;
          </div>
        </Link>
      </div>

      {/* Lista de Turmas Recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Turmas Recentes
          </h2>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {turmas.length === 0 ? (
            <div className="px-6 py-4 text-[#374151]/70">
              Nenhuma turma encontrada
            </div>
          ) : (
            turmas.map((turma) => (
              <div
                key={turma.id}
                className="px-6 py-4 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[#374151]">{turma.nome}</h3>
                    <p className="text-sm text-[#374151]/70">
                      {turma.turno} • {turma.totalAlunos} alunos •{" "}
                      {turma.disciplinas.length} disciplinas
                    </p>
                  </div>
                  <Link
                    href={`/professor/turmas/${turma.id}`}
                    className="text-sm text-[#1E3A8A] hover:text-[#15286D] font-medium"
                  >
                    Ver detalhes &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 