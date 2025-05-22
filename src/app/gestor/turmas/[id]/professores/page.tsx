"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
  disciplinas: Disciplina[];
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  professores: Professor[];
}

export default function GerenciarProfessoresPage() {
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
        const response = await fetch(`/api/gestor/turmas/${params.id}/professores`);
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

  const handleRemoveProfessor = async (professorId: string) => {
    if (!confirm("Tem certeza que deseja remover este professor da turma?")) {
      return;
    }

    try {
      setIsRemoving(professorId);
      const response = await fetch(
        `/api/gestor/turmas/${params.id}/professores/${professorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover professor da turma");
      }

      // Atualiza a lista de professores
      setTurma((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          professores: prev.professores.filter(
            (professor) => professor.id !== professorId
          ),
        };
      });
    } catch (err) {
      setError("Erro ao remover professor da turma");
      console.error(err);
    } finally {
      setIsRemoving(null);
    }
  };

  const filteredProfessores = turma?.professores.filter(
    (professor) =>
      professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.disciplinas.some((disciplina) =>
        disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
              Gerenciar Professores - {turma.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {turma.codigo} - {getTurnoLabel(turma.turno)}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/gestor/turmas/${turma.id}/professores/adicionar`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Adicionar Professores
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
            placeholder="Buscar professores por nome, email ou disciplina..."
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplinas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessores?.map((professor) => (
                <tr key={professor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {professor.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{professor.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {professor.disciplinas.map((disciplina) => (
                        <span
                          key={disciplina.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {disciplina.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/gestor/professores/${professor.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => handleRemoveProfessor(professor.id)}
                        disabled={isRemoving === professor.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRemoving === professor.id ? (
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
              {filteredProfessores?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Nenhum professor encontrado com os critérios de busca"
                      : "Nenhum professor atribuído a esta turma"}
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