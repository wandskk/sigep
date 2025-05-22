"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Dialog, Combobox, Transition } from "@headlessui/react";
import { PlusIcon, TrashIcon, CheckIcon, ChevronUpDownIcon, UserPlusIcon, UserIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";

interface Turma {
  id: string;
  nome: string;
  disciplinas: {
    id: string;
    nome: string;
    professor: {
      id: string;
      nome: string;
    } | null;
  }[];
  _count: {
    alunos: number;
    professores: number;
  };
}

interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
}

interface Professor {
  id: string;
  nome: string;
}

interface DisciplinaSelecionada {
  id: string;
  nome: string;
  selecionada: boolean;
  professorId: string;
}

const disciplinaProfessorSchema = z.object({
  disciplinasComProfessores: z.array(
    z.object({
      disciplinaId: z.string().min(1, "Disciplina é obrigatória"),
      professorId: z.string().min(1, "Professor é obrigatório"),
    })
  )
});

type DisciplinaProfessorFormData = z.infer<typeof disciplinaProfessorSchema>;

export default function TurmaDetalhesPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<DisciplinaSelecionada[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selecionarTodas, setSelecionarTodas] = useState(false);
  const [professorPadrao, setProfessorPadrao] = useState<string>("");
  
  // Estados para o modal de atribuir professor
  const [isAtribuirProfessorModalOpen, setIsAtribuirProfessorModalOpen] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>("");
  const [nomeDisciplinaSelecionada, setNomeDisciplinaSelecionada] = useState<string>("");
  const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(null);
  const [professorQuery, setProfessorQuery] = useState<string>("");
  
  // Estados para o modal de confirmação de exclusão
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [disciplinaParaExcluir, setDisciplinaParaExcluir] = useState<{id: string, nome: string} | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DisciplinaProfessorFormData>({
    resolver: zodResolver(disciplinaProfessorSchema),
    defaultValues: {
      disciplinasComProfessores: [],
    }
  });

  useEffect(() => {
    console.log("Status de autenticação:", status);
    console.log("Sessão:", session);
    
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "GESTOR") {
      console.log("Usuário não é gestor:", session?.user?.role);
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "GESTOR") {
      console.log("Iniciando busca de dados para a turma:", params.id);
      fetchTurma();
      fetchDisciplinas();
      fetchProfessores();
    }
  }, [session, params.id]);

  const fetchTurma = async () => {
    try {
      console.log("Buscando dados da turma:", params.id);
      const response = await fetch(`/api/gestor/turmas/${params.id}`);
      
      console.log("Resposta da API de turma:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API:", errorText);
        throw new Error(`Erro ao carregar turma: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Dados da turma recebidos:", data);
      setTurma(data);
    } catch (err) {
      console.error("Erro ao buscar turma:", err);
      setError("Não foi possível carregar os dados da turma");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisciplinas = async () => {
    try {
      const response = await fetch("/api/gestor/disciplinas");
      if (!response.ok) {
        throw new Error("Erro ao carregar disciplinas");
      }
      const data = await response.json();
      setDisciplinas(data);
      
      // Inicializa as disciplinas selecionáveis
      setDisciplinasSelecionadas(
        data.map((disciplina: Disciplina) => ({
          id: disciplina.id,
          nome: disciplina.nome,
          selecionada: false,
          professorId: "",
        }))
      );
    } catch (err) {
      console.error("Erro ao buscar disciplinas:", err);
    }
  };

  const fetchProfessores = async () => {
    try {
      const response = await fetch("/api/gestor/professores");
      if (!response.ok) {
        throw new Error("Erro ao carregar professores");
      }
      const data = await response.json();
      setProfessores(data);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
    }
  };

  const handleDisciplinaChange = (disciplinaId: string, checked: boolean) => {
    const novasSelecionadas = disciplinasSelecionadas.map((d) =>
      d.id === disciplinaId ? { ...d, selecionada: checked } : d
    );
    
    setDisciplinasSelecionadas(novasSelecionadas);
    
    // Verifica se todas estão selecionadas ou não
    const todasSelecionadas = novasSelecionadas.every((d) => d.selecionada);
    if (selecionarTodas !== todasSelecionadas) {
      setSelecionarTodas(todasSelecionadas);
    }
  };

  const handleSelecionarTodas = (checked: boolean) => {
    setSelecionarTodas(checked);
    setDisciplinasSelecionadas(
      disciplinasSelecionadas.map((d) => ({
        ...d,
        selecionada: checked
      }))
    );
  };

  const handleProfessorChange = (disciplinaId: string, professorId: string) => {
    setDisciplinasSelecionadas(
      disciplinasSelecionadas.map((d) =>
        d.id === disciplinaId ? { ...d, professorId } : d
      )
    );
  };

  const handleProfessorPadraoChange = (professorId: string) => {
    setProfessorPadrao(professorId);
    if (professorId) {
      // Aplica o professor a todas as disciplinas selecionadas
      setDisciplinasSelecionadas(
        disciplinasSelecionadas.map((d) => 
          d.selecionada ? { ...d, professorId } : d
        )
      );
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const disciplinasParaAdicionar = disciplinasSelecionadas
        .filter((d) => d.selecionada)
        .map((d) => ({
          disciplinaId: d.id,
          professorId: d.professorId || undefined,
        }));

      if (disciplinasParaAdicionar.length === 0) {
        setError("Selecione ao menos uma disciplina");
        setIsSubmitting(false);
        return;
      }

      // Faz requisições em sequência para adicionar cada disciplina
      for (const item of disciplinasParaAdicionar) {
        const response = await fetch(`/api/gestor/turmas/${params.id}/disciplinas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Erro ao adicionar disciplinas");
        }
      }

      setSuccess("Disciplinas adicionadas com sucesso!");
      setIsModalOpen(false);
      setSelecionarTodas(false);
      setProfessorPadrao("");
      
      // Reseta o estado das disciplinas selecionadas
      setDisciplinasSelecionadas(
        disciplinasSelecionadas.map((d) => ({
          ...d,
          selecionada: false,
          professorId: "",
        }))
      );
      
      fetchTurma();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar disciplinas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoverDisciplina = async (disciplinaId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `/api/gestor/turmas/${params.id}/disciplinas/${disciplinaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao remover disciplina");
      }

      setSuccess("Disciplina removida com sucesso!");
      fetchTurma();
      setIsConfirmDeleteModalOpen(false);
      setDisciplinaParaExcluir(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para confirmar a exclusão de disciplina
  const confirmarRemoverDisciplina = (disciplinaId: string, disciplinaNome: string) => {
    setDisciplinaParaExcluir({ id: disciplinaId, nome: disciplinaNome });
    setIsConfirmDeleteModalOpen(true);
  };

  // Função para abrir o modal de atribuir professor
  const openAtribuirProfessorModal = (disciplinaId: string, disciplinaNome: string) => {
    setDisciplinaSelecionada(disciplinaId);
    setNomeDisciplinaSelecionada(disciplinaNome);
    setProfessorSelecionado(null);
    setProfessorQuery("");
    setIsAtribuirProfessorModalOpen(true);
  };

  // Função para atribuir professor à disciplina
  const handleAtribuirProfessor = async () => {
    if (!professorSelecionado || !disciplinaSelecionada) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/gestor/turmas/${params.id}/disciplinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disciplinaId: disciplinaSelecionada,
          professorId: professorSelecionado.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao atribuir professor à disciplina");
      }

      setSuccess(`Professor ${professorSelecionado.nome} atribuído com sucesso à disciplina ${nomeDisciplinaSelecionada}!`);
      setIsAtribuirProfessorModalOpen(false);
      fetchTurma();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atribuir professor à disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Professores filtrados para o autocomplete
  const filteredProfessores = professorQuery === ''
    ? professores
    : professores.filter((professor) =>
        professor.nome.toLowerCase().includes(professorQuery.toLowerCase())
      );

  if (status === "loading" || isLoading) {
    console.log("Exibindo estado de loading");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session) {
    console.log("Sem sessão, retornando null");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Não autenticado. Redirecionando...</div>
      </div>
    );
  }
  
  if (session.user.role !== "GESTOR") {
    console.log("Usuário não é gestor, retornando null");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Acesso não autorizado. Redirecionando...</div>
      </div>
    );
  }
  
  if (!turma) {
    console.log("Dados da turma não carregados, retornando null");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          {error || "Não foi possível carregar os dados da turma"}
        </div>
      </div>
    );
  }

  // Filtra as disciplinas que já estão na turma
  const disciplinasDisponiveis = disciplinas.filter(
    (disciplina) => !turma.disciplinas.some((d) => d.id === disciplina.id)
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#374151]">{turma.nome}</h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                {turma._count.alunos} alunos • {turma._count.professores} professores
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
              disabled={disciplinasDisponiveis.length === 0}
            >
              <PlusIcon className="h-5 w-5" />
              Adicionar Disciplinas
            </Button>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              {success}
            </Alert>
          )}

          {turma.disciplinas.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Esta turma ainda não possui disciplinas. Clique em "Adicionar Disciplinas" para começar.
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
                      Disciplina
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Professor
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
                  {turma.disciplinas.map((disciplina) => (
                    <tr key={disciplina.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {disciplina.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {disciplina.professor?.nome || "Não atribuído"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                        {disciplina.professor ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openAtribuirProfessorModal(disciplina.id, disciplina.nome)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1"
                          >
                            <UserIcon className="h-4 w-4" />
                            Alterar Professor
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => openAtribuirProfessorModal(disciplina.id, disciplina.nome)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1"
                          >
                            <UserPlusIcon className="h-4 w-4" />
                            Atribuir Professor
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmarRemoverDisciplina(disciplina.id, disciplina.nome)}
                          disabled={isSubmitting}
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={isConfirmDeleteModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsConfirmDeleteModalOpen(false);
            setDisciplinaParaExcluir(null);
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Confirmar Exclusão
            </Dialog.Title>

            <p className="mb-4 text-gray-600">
              Tem certeza que deseja remover a disciplina <span className="font-semibold">{disciplinaParaExcluir?.nome}</span> desta turma?
            </p>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsConfirmDeleteModalOpen(false);
                  setDisciplinaParaExcluir(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => disciplinaParaExcluir && handleRemoverDisciplina(disciplinaParaExcluir.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Removendo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Adicionar Disciplinas */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setSelecionarTodas(false);
            setProfessorPadrao("");
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Adicionar Disciplinas
            </Dialog.Title>

            <div className="space-y-4">
              {disciplinasDisponiveis.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Não há disciplinas disponíveis para adicionar.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                      Selecione as disciplinas e atribua um professor para cada uma.
                    </p>
                    <div className="flex items-center">
                      <input
                        id="selecionar-todas"
                        type="checkbox"
                        className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded mr-2"
                        checked={selecionarTodas}
                        onChange={(e) => handleSelecionarTodas(e.target.checked)}
                      />
                      <label
                        htmlFor="selecionar-todas"
                        className="text-sm font-medium text-gray-700"
                      >
                        Selecionar Todas
                      </label>
                    </div>
                  </div>

                  {disciplinasSelecionadas.some(d => d.selecionada) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label htmlFor="professor-padrao" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Definir professor para todas:
                        </label>
                        <div className="flex-1">
                          <select
                            id="professor-padrao"
                            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                            value={professorPadrao}
                            onChange={(e) => handleProfessorPadraoChange(e.target.value)}
                          >
                            <option value="">Selecionar professor</option>
                            {professores.map((professor) => (
                              <option key={professor.id} value={professor.id}>
                                {professor.nome}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500 italic">
                            Atribuir professor é opcional. Você pode adicionar disciplinas sem professores e atribuí-los posteriormente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {disciplinasDisponiveis.map((disciplina) => (
                      <div key={disciplina.id} className="border rounded-md p-3">
                        <div className="flex items-start mb-2">
                          <div className="flex items-center h-5">
                            <input
                              id={`disciplina-${disciplina.id}`}
                              type="checkbox"
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded"
                              checked={
                                disciplinasSelecionadas.find(
                                  (d) => d.id === disciplina.id
                                )?.selecionada || false
                              }
                              onChange={(e) =>
                                handleDisciplinaChange(disciplina.id, e.target.checked)
                              }
                            />
                          </div>
                          <label
                            htmlFor={`disciplina-${disciplina.id}`}
                            className="ml-3 block text-sm font-medium text-gray-700"
                          >
                            {disciplina.nome}
                          </label>
                        </div>

                        {disciplinasSelecionadas.find(
                          (d) => d.id === disciplina.id
                        )?.selecionada && (
                          <div className="pl-7">
                            <label
                              htmlFor={`professor-${disciplina.id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Professor (opcional):
                            </label>
                            <select
                              id={`professor-${disciplina.id}`}
                              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                              value={
                                disciplinasSelecionadas.find(
                                  (d) => d.id === disciplina.id
                                )?.professorId || ""
                              }
                              onChange={(e) =>
                                handleProfessorChange(disciplina.id, e.target.value)
                              }
                            >
                              <option value="">Sem professor</option>
                              {professores.map((professor) => (
                                <option key={professor.id} value={professor.id}>
                                  {professor.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={onSubmit}
                  disabled={
                    isSubmitting || 
                    !disciplinasSelecionadas.some((d) => d.selecionada)
                  }
                >
                  {isSubmitting ? "Adicionando..." : "Adicionar Selecionadas"}
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Atribuir Professor */}
      <Transition appear show={isAtribuirProfessorModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => !isSubmitting && setIsAtribuirProfessorModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
                <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
                  Atribuir Professor à Disciplina
                </Dialog.Title>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Disciplina:</p>
                  <p className="font-medium">{nomeDisciplinaSelecionada}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecione um Professor:
                  </label>
                  <Combobox value={professorSelecionado} onChange={setProfessorSelecionado}>
                    <div className="relative mt-1">
                      <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 focus-within:border-[#1E3A8A] focus-within:ring-1 focus-within:ring-[#1E3A8A]">
                        <Combobox.Input
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-0"
                          displayValue={(professor: Professor) => professor?.nome || ''}
                          onChange={(event) => setProfessorQuery(event.target.value)}
                          placeholder="Buscar professor..."
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setProfessorQuery('')}
                      >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                          {filteredProfessores.length === 0 && professorQuery !== '' ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                              Nenhum professor encontrado.
                            </div>
                          ) : (
                            filteredProfessores.map((professor) => (
                              <Combobox.Option
                                key={professor.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-[#1E3A8A] text-white' : 'text-gray-900'
                                  }`
                                }
                                value={professor}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {professor.nome}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active ? 'text-white' : 'text-[#1E3A8A]'
                                        }`}
                                      >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsAtribuirProfessorModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAtribuirProfessor}
                    disabled={isSubmitting || !professorSelecionado}
                  >
                    {isSubmitting ? "Atribuindo..." : "Atribuir Professor"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 