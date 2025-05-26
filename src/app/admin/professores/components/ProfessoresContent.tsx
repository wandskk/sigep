"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@headlessui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/Select";
import { Controller } from "react-hook-form";
import { Plus, Mail, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Search } from "lucide-react";

interface Professor {
  id: string;
  nome: string;
  email?: string;
  senhaTemporaria?: string;
  escola?: {
    id: string;
    nome: string;
  } | null;
}

interface School {
  id: string;
  name: string;
}

const professorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  escolaId: z.string().min(1, "Escola é obrigatória"),
});

type ProfessorFormData = z.infer<typeof professorSchema>;

type ModalMode = "create" | "edit";

interface ProfessoresContentProps {
  professoresIniciais: Professor[];
  escolas: School[];
}

export function ProfessoresContent({ professoresIniciais, escolas }: ProfessoresContentProps) {
  const [professores, setProfessores] = useState<Professor[]>(professoresIniciais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [professorToEdit, setProfessorToEdit] = useState<Professor | null>(null);
  const [novoProfessor, setNovoProfessor] = useState<Professor | null>(null);
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
  });

  const handleDelete = async () => {
    if (!professorToDelete) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `/api/admin/professores/${professorToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao excluir professor");
      }

      setSuccess("Professor excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setProfessorToDelete(null);
      setProfessores(prev => prev.filter(p => p.id !== professorToDelete.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir professor"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mode: ModalMode, professor?: Professor) => {
    setModalMode(mode);
    if (mode === "edit" && professor) {
      setProfessorToEdit(professor);
      setValue("nome", professor.nome);
      if (professor.email) {
        setValue("email", professor.email);
      }
      if (professor.escola?.id) {
        setValue("escolaId", professor.escola.id);
      }
    } else {
      setProfessorToEdit(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setProfessorToEdit(null);
      reset();
    }
  };

  const onSubmit = async (data: ProfessorFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const url =
        modalMode === "edit"
          ? `/api/admin/professores/${professorToEdit?.id}`
          : "/api/admin/professores";

      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData ||
            `Erro ao ${modalMode === "edit" ? "editar" : "criar"} professor`
        );
      }

      const responseData = await response.json();
      
      if (modalMode === "create" && responseData.senhaTemporaria) {
        setNovoProfessor(responseData);
        setIsSenhaModalOpen(true);
      } else {
        setSuccess(
          `Professor ${modalMode === "edit" ? "editado" : "criado"} com sucesso!`
        );
      }
      
      closeModal();
      if (modalMode === "edit") {
        setProfessores(prev => prev.map(p => 
          p.id === professorToEdit?.id ? {
            id: responseData.id,
            nome: responseData.name,
            email: responseData.email,
            escola: responseData.professor?.escola ? {
              id: responseData.professor.escola.id,
              nome: responseData.professor.escola.name,
            } : null,
          } : p
        ));
      } else {
        setProfessores(prev => [...prev, {
          id: responseData.id,
          nome: responseData.name,
          email: responseData.email,
          escola: responseData.professor?.escola ? {
            id: responseData.professor.escola.id,
            nome: responseData.professor.escola.name,
          } : null,
        }]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao ${modalMode === "edit" ? "editar" : "criar"} professor`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copiarParaAreaDeTransferencia = (texto: string) => {
    navigator.clipboard.writeText(texto).then(
      () => {
        setSuccess("Texto copiado para a área de transferência!");
        setTimeout(() => setSuccess(null), 3000);
      },
      (err) => {
        setError("Erro ao copiar texto: " + err);
      }
    );
  };

  const filteredProfessores = professores.filter((professor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      professor.nome.toLowerCase().includes(searchLower) ||
      professor.email?.toLowerCase().includes(searchLower) ||
      professor.escola?.nome.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader 
          size="lg" 
          variant="primary" 
          text="Carregando professores..." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gerenciamento de Professores
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie todos os professores cadastrados no sistema
        </p>
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

      {/* Barra de Pesquisa + Botão */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Buscar professores por nome, email ou escola..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => openModal("create")}
          className="w-full sm:w-auto whitespace-nowrap cursor-pointer bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Professor
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="hidden sm:table-header-group">
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Nome</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>Email</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>Escola</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProfessores.map((professor) => (
                <tr
                  key={professor.id}
                  className="group transition-colors duration-150 hover:bg-blue-50/50"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {professor.nome}
                        </div>
                        <div className="sm:hidden mt-1 space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                            {professor.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Building2 className="h-4 w-4 mr-1.5 text-gray-400" />
                            {professor.escola?.nome || "Sem escola atribuída"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{professor.email}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {professor.escola?.nome || "Sem escola atribuída"}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal("edit", professor)}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        title="Editar professor"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfessorToDelete(professor);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        title="Excluir professor"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProfessores.length === 0 && (
          <div className="text-center py-12 bg-white">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum professor encontrado com os termos da busca"
                : "Nenhum professor cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => openModal("create")}
                className="mt-4 cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar primeiro professor
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Criar/Editar Professor */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              {modalMode === "edit" ? "Editar" : "Novo"} Professor
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome
                </label>
                <Input
                  id="nome"
                  type="text"
                  {...register("nome")}
                  error={errors.nome?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="escolaId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Escola
                </label>
                <Controller
                  name="escolaId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="escolaId" className={errors.escolaId?.message ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma escola" />
                      </SelectTrigger>
                      <SelectContent>
                        {escolas.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id}>
                            {escola.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.escolaId?.message && (
                  <p className="text-sm text-red-600">{errors.escolaId.message}</p>
                )}
              </div>

              <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Uma senha temporária será gerada automaticamente. O professor deverá alterá-la no primeiro acesso ao sistema.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Salvando..."
                    : modalMode === "edit"
                    ? "Salvar"
                    : "Criar"}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Confirmar Exclusão */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsDeleteModalOpen(false);
            setProfessorToDelete(null);
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
              Tem certeza que deseja excluir o professor{" "}
              <span className="font-semibold">{professorToDelete?.nome}</span>?
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProfessorToDelete(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Excluindo..." : "Excluir Professor"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Credenciais do Novo Professor */}
      <Dialog
        open={isSenhaModalOpen}
        onClose={() => {
          setIsSenhaModalOpen(false);
          setNovoProfessor(null);
          setSuccess("Professor criado com sucesso!");
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Credenciais do Professor
            </Dialog.Title>

            <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium mb-2">
                Importante: Anote ou copie estas informações
              </p>
              <p className="text-sm text-yellow-600">
                Esta é a única vez que você verá a senha temporária. Forneça estas credenciais ao professor para que ele possa acessar o sistema.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <div className="flex items-center">
                  <div className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {novoProfessor?.nome}
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    className="ml-2" 
                    onClick={() => novoProfessor?.nome && copiarParaAreaDeTransferencia(novoProfessor.nome)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <div className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {novoProfessor?.email}
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    className="ml-2" 
                    onClick={() => novoProfessor?.email && copiarParaAreaDeTransferencia(novoProfessor.email)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Temporária
                </label>
                <div className="flex items-center">
                  <div className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-mono">
                    {novoProfessor?.senhaTemporaria}
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    className="ml-2" 
                    onClick={() => novoProfessor?.senhaTemporaria && copiarParaAreaDeTransferencia(novoProfessor.senhaTemporaria)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruções de Acesso
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                  <p>1. Acesse a página de login: <span className="font-medium">http://localhost:3000/login</span></p>
                  <p>2. Informe o email e a senha fornecidos acima</p>
                  <p>3. Na primeira vez, o professor será solicitado a trocar a senha temporária</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsSenhaModalOpen(false);
                  setNovoProfessor(null);
                  setSuccess("Professor criado com sucesso!");
                }}
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (novoProfessor) {
                    const credenciais = `
Nome: ${novoProfessor.nome}
Email: ${novoProfessor.email}
Senha: ${novoProfessor.senhaTemporaria}

Instruções de acesso:
1. Acesse a página de login: http://localhost:3000/login
2. Informe o email e a senha fornecidos acima
3. Na primeira vez, você será solicitado a trocar a senha temporária
`;
                    copiarParaAreaDeTransferencia(credenciais);
                  }
                }}
              >
                Copiar Tudo
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 