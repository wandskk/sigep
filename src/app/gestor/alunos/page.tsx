"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ModalAluno } from "./components/ModalAluno";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  dataNascimento: string;
  turma: {
    id: string;
    nome: string;
    codigo: string;
    turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  } | null;
}

export default function AlunosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alunoParaEditar, setAlunoParaEditar] = useState<Aluno | null>(null);
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<Aluno | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "GESTOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "GESTOR") {
      fetchAlunos();
    }
  }, [session]);

  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/gestor/alunos");
      if (!response.ok) {
        throw new Error("Erro ao carregar alunos");
      }
      const data = await response.json();
      setAlunos(data);
    } catch (err) {
      setError("Erro ao carregar alunos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirAluno = async () => {
    if (!alunoParaExcluir) return;

    try {
      setExcluindo(true);
      const response = await fetch(
        `/api/gestor/alunos/${alunoParaExcluir.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir aluno");
      }

      setAlunos(alunos.filter((a) => a.id !== alunoParaExcluir.id));
      setAlunoParaExcluir(null);
    } catch (err) {
      setError("Erro ao excluir aluno");
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  };

  const handleOpenModal = (aluno?: Aluno) => {
    setAlunoParaEditar(aluno || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAlunoParaEditar(null);
  };

  const filteredAlunos = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTurnoLabel = (turno: string) => {
    const turnos = {
      MATUTINO: "Matutino",
      VESPERTINO: "Vespertino",
      NOTURNO: "Noturno",
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Não autenticado. Redirecionando...</div>
      </div>
    );
  }

  if (session.user.role !== "GESTOR") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          Acesso não autorizado. Redirecionando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#374151]">Alunos</h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                Gerencie os alunos da sua escola
              </p>
            </div>
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => handleOpenModal()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Novo Aluno
            </Button>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar alunos por nome, matrícula ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
            />
          </div>

          {alunos.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Nenhum aluno cadastrado. Clique em "Novo Aluno" para começar.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Matrícula
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data de Nascimento
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Turma
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aluno.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aluno.matricula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aluno.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(aluno.dataNascimento).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aluno.turma ? (
                          <span className="text-[#1E3A8A]">
                            {aluno.turma.nome} ({aluno.turma.codigo} -{" "}
                            {getTurnoLabel(aluno.turma.turno)})
                          </span>
                        ) : (
                          <span className="text-gray-400">Sem turma</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(aluno)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setAlunoParaExcluir(aluno)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredAlunos.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Nenhum aluno encontrado com os critérios de busca
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalAluno
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          fetchAlunos();
          handleCloseModal();
        }}
        aluno={alunoParaEditar || undefined}
      />

      {/* Modal de Confirmação de Exclusão */}
      {alunoParaExcluir && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja excluir o aluno {alunoParaExcluir.nome}?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAlunoParaExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleExcluirAluno}
                isLoading={excluindo}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
