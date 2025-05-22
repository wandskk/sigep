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
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  alunos: Aluno[];
}

export default function GerenciarAlunosPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.role !== UserRole.GESTOR) {
      router.push("/");
      return;
    }

    const fetchTurma = async () => {
      try {
        const response = await fetch(`/api/gestor/turmas/${params.id}/alunos`);
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

    fetchTurma();
  }, [session, params.id, router]);

  const handleRemoveAluno = async (alunoId: string) => {
    if (!confirm("Tem certeza que deseja remover este aluno da turma?")) {
      return;
    }

    try {
      setIsRemoving(alunoId);
      const response = await fetch(
        `/api/gestor/turmas/${params.id}/alunos/${alunoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover aluno da turma");
      }

      // Atualiza a lista de alunos
      setTurma((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          alunos: prev.alunos.filter((aluno) => aluno.id !== alunoId),
        };
      });
    } catch (err) {
      setError("Erro ao remover aluno da turma");
      console.error(err);
    } finally {
      setIsRemoving(null);
    }
  };

  const filteredAlunos = turma?.alunos.filter(
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
              Gerenciar Alunos - {turma.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {turma.codigo} - {getTurnoLabel(turma.turno)}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/gestor/turmas/${turma.id}/alunos/adicionar`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Adicionar Alunos
            </Link>
            <Link
              href={`/gestor/turmas/${turma.id}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Voltar para Turma
            </Link>
          </div>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlunos?.map((aluno) => (
                <tr key={aluno.id}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/gestor/alunos/${aluno.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => handleRemoveAluno(aluno.id)}
                        disabled={isRemoving === aluno.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRemoving === aluno.id ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-1 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            Removendo...
                          </div>
                        ) : (
                          "Remover"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlunos?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Nenhum aluno encontrado com os critérios de busca"
                      : "Nenhum aluno matriculado nesta turma"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 