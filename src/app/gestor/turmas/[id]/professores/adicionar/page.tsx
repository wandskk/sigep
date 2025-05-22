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
}

export default function AdicionarProfessoresPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessores, setSelectedProfessores] = useState<string[]>([]);
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

        // Busca os professores disponíveis
        const professoresResponse = await fetch(
          `/api/gestor/turmas/${params.id}/professores/disponiveis`
        );
        if (!professoresResponse.ok) {
          throw new Error("Erro ao carregar professores disponíveis");
        }
        const professoresData = await professoresResponse.json();
        setProfessores(professoresData);
      } catch (err) {
        setError("Erro ao carregar dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, params.id, router]);

  const handleSubmit = async () => {
    if (selectedProfessores.length === 0) {
      setError("Selecione pelo menos um professor");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Adiciona cada professor selecionado à turma
      for (const professorId of selectedProfessores) {
        const response = await fetch(
          `/api/gestor/turmas/${params.id}/professores`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ professorId }),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao adicionar professor à turma");
        }
      }

      // Redireciona para a página de gerenciamento de professores
      router.push(`/gestor/turmas/${params.id}/professores`);
    } catch (err) {
      setError("Erro ao adicionar professores à turma");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProfessores = professores.filter(
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
              Adicionar Professores - {turma.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {turma.codigo} - {getTurnoLabel(turma.turno)}
            </p>
          </div>
          <Link
            href={`/gestor/turmas/${turma.id}/professores`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Voltar
          </Link>
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
                  Selecionar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplinas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessores.map((professor) => (
                <tr key={professor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProfessores.includes(professor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProfessores([
                            ...selectedProfessores,
                            professor.id,
                          ]);
                        } else {
                          setSelectedProfessores(
                            selectedProfessores.filter((id) => id !== professor.id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
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
                </tr>
              ))}
              {filteredProfessores.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Nenhum professor encontrado com os critérios de busca"
                      : "Nenhum professor disponível para adicionar"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-center">{error}</div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProfessores.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adicionando...
              </div>
            ) : (
              `Adicionar ${selectedProfessores.length} professor${
                selectedProfessores.length !== 1 ? "es" : ""
              }`
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 