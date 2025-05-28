"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/Modal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { cn, formatPhoneNumber } from "@/lib/utils";
import { useSchools } from "@/hooks/useSchools";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { School } from "@/types/school";
import Link from "next/link";
import { Building2, Search, MapPin, Phone, Mail, User, Plus, ChevronRight, Eye } from "lucide-react";

interface SchoolsClientProps {
  initialSchools: School[];
}

export function SchoolsClient({ initialSchools }: SchoolsClientProps) {
  const {
    schools,
    error,
    success,
    searchTerm,
    setSearchTerm,
    createSchool,
    updateSchool,
    deleteSchool,
    setError,
    setSuccess,
  } = useSchools({ initialSchools });

  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [createSchoolError, setCreateSchoolError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [editSchoolError, setEditSchoolError] = useState<string | null>(null);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalHeight, setModalHeight] = useState<number>(0);

  

  const handleCreateSchool = async (data: any) => {
    setIsCreatingSchool(true);
    setCreateSchoolError(null);

    const success = await createSchool(data);
    if (success) {
      setIsNewSchoolModalOpen(false);
    } else {
      setCreateSchoolError(error);
    }

    setIsCreatingSchool(false);
  };

  const handleEditSchool = async (data: any) => {
    if (!schoolToEdit) return;

    setIsEditingSchool(true);
    setEditSchoolError(null);

    const success = await updateSchool(schoolToEdit.id, data);
    if (success) {
      setIsEditModalOpen(false);
      setSchoolToEdit(null);
    } else {
      setEditSchoolError(error);
    }

    setIsEditingSchool(false);
  };

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;

    setIsDeleting(true);
    const success = await deleteSchool(schoolToDelete.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setSchoolToDelete(null);
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Gerenciamento de Escolas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todas as escolas cadastradas no sistema
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsNewSchoolModalOpen(true)}
          className="w-full sm:w-auto whitespace-nowrap cursor-pointer bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Escola
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

      {/* Barra de Pesquisa */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Buscar escolas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Visualização Mobile (Cards) */}
      <div className="sm:hidden space-y-4">
        {schools.map((school) => (
          <Card
            key={school.id}
            className={cn(
              "p-4 transition-colors duration-150 hover:bg-blue-50/50",
              (isDeleting && schoolToDelete?.id === school.id) ||
              (isEditingSchool && schoolToEdit?.id === school.id) && "opacity-50 pointer-events-none"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">{school.name}</h3>
                  <div className="mt-1 space-y-1.5">
                    <div className="flex items-start text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="break-words">
                        {school.address}, {school.city} - {school.state}
                      </span>
                    </div>
                    {school.gestor && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">
                          {school.gestor.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Link href={`/admin/escolas/${school.id}`} className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-blue-50 !bg-blue-50 border border-blue-200 font-bold text-base py-2 text-black"
                  style={{ color: '#000', fontWeight: 'bold', backgroundColor: '#f0f6ff' }}
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => {
                  setSchoolToEdit(school);
                  setIsEditModalOpen(true);
                }}
                disabled={
                  (isDeleting && schoolToDelete?.id === school.id) ||
                  (isEditingSchool && schoolToEdit?.id === school.id)
                }
                className="flex-1 bg-amber-50 !bg-amber-50 border border-amber-200 font-bold text-base py-2 text-black"
                style={{ color: '#000', fontWeight: 'bold', backgroundColor: '#fffbeb' }}
                title="Editar escola"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSchoolToDelete(school);
                  setIsDeleteModalOpen(true);
                }}
                disabled={
                  (isDeleting && schoolToDelete?.id === school.id) ||
                  (isEditingSchool && schoolToEdit?.id === school.id)
                }
                className="flex-1 bg-red-50 !bg-red-50 border border-red-200 font-bold text-base py-2 text-black"
                style={{ color: '#000', fontWeight: 'bold', backgroundColor: '#fef2f2' }}
                title="Excluir escola"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </Card>
        ))}

        {schools.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhuma escola encontrada com os termos da busca"
                : "Nenhuma escola cadastrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => setIsNewSchoolModalOpen(true)}
                className="mt-4 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar primeira escola
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Visualização Desktop (Tabela) */}
      <Card className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>Nome</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Gestor Responsável</span>
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
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map((school) => (
                <tr
                  key={school.id}
                  className={cn(
                    "group transition-colors duration-150 hover:bg-blue-50/50",
                    (isDeleting && schoolToDelete?.id === school.id) ||
                    (isEditingSchool && schoolToEdit?.id === school.id) && "opacity-50 pointer-events-none"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">
                          {school.address}, {school.city} - {school.state}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {school.gestor ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {school.gestor.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {school.gestor.user.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        Não definido
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/admin/escolas/${school.id}`}>
                        <Button
                          size="sm"
                          className="text-white font-bold bg-blue-500 border border-blue-600"
                          style={{ fontWeight: 'bold', backgroundColor: '#3b82f6', color: '#fff' }}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSchoolToEdit(school);
                          setIsEditModalOpen(true);
                        }}
                        disabled={
                          (isDeleting && schoolToDelete?.id === school.id) ||
                          (isEditingSchool && schoolToEdit?.id === school.id)
                        }
                        className="text-white font-bold bg-amber-400 border border-amber-500"
                        style={{ fontWeight: 'bold', backgroundColor: '#f59e42', color: '#fff' }}
                        title="Editar escola"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSchoolToDelete(school);
                          setIsDeleteModalOpen(true);
                        }}
                        disabled={
                          (isDeleting && schoolToDelete?.id === school.id) ||
                          (isEditingSchool && schoolToEdit?.id === school.id)
                        }
                        className="text-white font-bold bg-red-500 border border-red-600"
                        style={{ fontWeight: 'bold', backgroundColor: '#ef4444', color: '#fff' }}
                        title="Excluir escola"
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

        {schools.length === 0 && (
          <div className="text-center py-12 bg-white">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhuma escola encontrada com os termos da busca"
                : "Nenhuma escola cadastrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => setIsNewSchoolModalOpen(true)}
                className="mt-4 cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar primeira escola
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Nova Escola */}
      <Modal open={isNewSchoolModalOpen} onOpenChange={setIsNewSchoolModalOpen}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <ModalTitle>Nova Escola</ModalTitle>
          </ModalHeader>
          <SchoolForm
            onSubmit={handleCreateSchool}
            onCancel={() => {
              setIsNewSchoolModalOpen(false);
              setCreateSchoolError(null);
            }}
            isSubmitting={isCreatingSchool}
            error={createSchoolError}
            onHeightChange={setModalHeight}
          />
        </ModalContent>
      </Modal>

      {/* Modal de Edição de Escola */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <ModalTitle>Editar Escola</ModalTitle>
          </ModalHeader>
          {schoolToEdit && (
            <SchoolForm
              school={schoolToEdit}
              onSubmit={handleEditSchool}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSchoolToEdit(null);
                setEditSchoolError(null);
              }}
              isSubmitting={isEditingSchool}
              error={editSchoolError}
              onHeightChange={setModalHeight}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Confirmar Exclusão */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Confirmar Exclusão</ModalTitle>
          </ModalHeader>
          <div className="p-6">
            <p className="mb-4 text-gray-600">
              Tem certeza que deseja excluir a escola {" "}
              <span className="font-semibold">{schoolToDelete?.name}</span>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSchoolToDelete(null);
                }}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteSchool}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? "Excluindo..." : "Excluir Escola"}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
} 