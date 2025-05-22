"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  dataNascimento: string;
  turmaId: string | null;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
}

export default function AdicionarAlunosPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user.role !== UserRole.GESTOR) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Busca os detalhes da turma
        const turmaResponse = await fetch(`/api/gestor/turmas/${params.id}`);
        if (!turmaResponse.ok) {
          throw new Error("Erro ao carregar dados da turma");
        }
        const turmaData = await turmaResponse.json();
        setTurma(turmaData);

        // Busca os alunos disponíveis
        const alunosResponse = await fetch(
          `/api/gestor/turmas/${params.id}/alunos/disponiveis`
        );
        if (!alunosResponse.ok) {
          throw new Error("Erro ao carregar alunos disponíveis");
        }
        const alunosData = await alunosResponse.json();
        setAlunos(alunosData);
      } catch (err) {
        setError("Erro ao carregar dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, params.id, router]);

  const handleSelectAluno = (alunoId: string) => {
    setSelectedAlunos((prev) =>
      prev.includes(alunoId)
        ? prev.filter((id) => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleSubmit = async () => {
    if (selectedAlunos.length === 0) {
      setError("Selecione pelo menos um aluno");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/gestor/turmas/${params.id}/alunos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alunoIds: selectedAlunos }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      router.push(`/gestor/turmas/${params.id}/alunos`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar alunos");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAlunos = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !turma) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error || "Turma não encontrada"}</div>
      </div>
    );
  }

  const getTurnoLabel = (turno: string) => {
    const turnos = {
      MATUTINO: "Matutino",
      VESPERTINO: "Vespertino",
      NOTURNO: "Noturno",
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Adicionar Alunos - {turma.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {turma.codigo} - {getTurnoLabel(turma.turno)}
            </p>
          </div>
          <Link
            href={`/gestor/turmas/${turma.id}/alunos`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Voltar para Lista
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar alunos por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Alunos Disponíveis
              </h2>
              <div className="text-sm text-gray-500">
                {selectedAlunos.length} aluno(s) selecionado(s)
              </div>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selecionar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Nascimento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlunos.map((aluno) => (
                <tr
                  key={aluno.id}
                  className={
                    selectedAlunos.includes(aluno.id)
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAlunos.includes(aluno.id)}
                      onChange={() => handleSelectAluno(aluno.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {aluno.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{aluno.matricula}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{aluno.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(aluno.dataNascimento).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlunos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Nenhum aluno encontrado com os critérios de busca"
                      : "Nenhum aluno disponível para adicionar"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Link
            href={`/gestor/turmas/${turma.id}/alunos`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedAlunos.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adicionando...
              </div>
            ) : (
              `Adicionar ${selectedAlunos.length} Aluno(s)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 