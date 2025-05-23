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

const professorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
});

type ProfessorFormData = z.infer<typeof professorSchema>;

type ModalMode = "create" | "edit";

interface ProfessoresContentProps {
  professoresIniciais: Professor[];
}

export function ProfessoresContent({ professoresIniciais }: ProfessoresContentProps) {
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
        `/api/gestor/professores/${professorToDelete.id}`,
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
          ? `/api/gestor/professores/${professorToEdit?.id}`
          : "/api/gestor/professores";

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
          p.id === professorToEdit?.id ? { ...p, ...data } : p
        ));
      } else {
        setProfessores(prev => [...prev, {
          ...responseData,
          escola: responseData.escola
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
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#374151]">Professores</h1>
        <Button
          variant="primary"
          onClick={() => openModal("create")}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Professor
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

      {professores.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Nenhum professor cadastrado. Clique em "Novo Professor" para começar.
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
                  Escola
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
              {professores.map((professor) => (
                <tr key={professor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {professor.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {professor.escola?.nome || "Sem escola atribuída"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal("edit", professor)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setProfessorToDelete(professor);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </>
  );
} 