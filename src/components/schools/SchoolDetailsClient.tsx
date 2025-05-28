"use client";

import { useState } from "react";
import { School, User } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SchoolForm } from "./SchoolForm";
import { Input } from "@/components/ui/Input";
import { ClassForm } from "@/components/classes/ClassForm";
import { useToast } from "@/components/ui/Toast";
import {
  Pencil,
  Users,
  GraduationCap,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User as UserIcon,
  Eye,
  Search,
  Plus,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { School as SchoolType } from "@/types/school";
import { cn } from "@/lib/utils";
import { ProfessoresContent } from "@/app/admin/professores/components/ProfessoresContent";

interface Class {
  id: string;
  name: string;
  grade: number;
  period: string;
  _count?: {
    alunos: number;
  };
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escolaId: string;
}

interface SchoolDetailsClientProps {
  school: School & {
    gestor: User | null;
    professors: User[];
    classes: Class[];
  };
}

// Função utilitária para formatar telefone brasileiro
function formatPhone(phone: string) {
  if (!phone) return "";
  // Remove tudo que não for número
  const cleaned = phone.replace(/\D/g, "");
  // Formato para celular com DDD: (99) 99999-9999
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  // Formato para telefone fixo com DDD: (99) 9999-9999
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  // Retorna o original se não bater
  return phone;
}

const tabs = [
  { id: "detalhes", label: "Detalhes", icon: Building2 },
  { id: "professores", label: "Professores", icon: Users },
  { id: "turmas", label: "Turmas", icon: GraduationCap },
];

export function SchoolDetailsClient({ school }: SchoolDetailsClientProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "detalhes";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [editSchoolError, setEditSchoolError] = useState<string | null>(null);
  const [modalHeight, setModalHeight] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isDeleteClassModalOpen, setIsDeleteClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Turma | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Transformar o school para o formato esperado pelo SchoolForm
  const schoolForForm: SchoolType = {
    id: school.id,
    name: school.name,
    address: school.address,
    city: school.city,
    state: school.state,
    phone: school.phone,
    email: school.email,
    website: school.website,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
    gestorId: school.gestorId,
    gestor: school.gestor
      ? {
          id: school.gestor.id,
          user: {
            id: school.gestor.id,
            name: school.gestor.name,
            email: school.gestor.email,
          },
        }
      : null,
  };

  const handleEditSchool = async (data: any) => {
    try {
      setIsEditingSchool(true);
      setEditSchoolError(null);

      const response = await fetch(`/api/admin/schools/${school.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar escola");
      }

      setIsEditModalOpen(false);
      router.refresh();
    } catch (error) {
      setEditSchoolError(
        error instanceof Error ? error.message : "Erro ao atualizar escola"
      );
    } finally {
      setIsEditingSchool(false);
    }
  };

  // Filtrar professores baseado na busca
  const filteredProfessors = school.professors.filter((professor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      professor.name.toLowerCase().includes(searchLower) ||
      professor.email?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar turmas baseado na busca
  const filteredClasses = school.classes.filter((turma) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      turma.name.toLowerCase().includes(searchLower) ||
      turma.period.toLowerCase().includes(searchLower)
    );
  });

  const handleViewClass = (classId: string) => {
    router.push(`/admin/turmas/${classId}`);
  };

  const handleEditClass = (classId: string) => {
    const classToEdit = school.classes.find((c) => c.id === classId);
    if (classToEdit) {
      setSelectedClass({
        id: classToEdit.id,
        nome: classToEdit.name,
        codigo: `${classToEdit.grade}.${classToEdit.id}`,
        turno: classToEdit.period.toUpperCase(),
        escolaId: school.id,
      });
      setIsEditClassModalOpen(true);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const classToDelete = school.classes.find((c) => c.id === classId);
    if (classToDelete) {
      setSelectedClass({
        id: classToDelete.id,
        nome: classToDelete.name,
        codigo: `${classToDelete.grade}.${classToDelete.id}`,
        turno: classToDelete.period.toUpperCase(),
        escolaId: school.id,
      });
      setIsDeleteClassModalOpen(true);
    }
  };

  const confirmDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      setIsDeletingClass(true);
      const response = await fetch(`/api/admin/turmas/${selectedClass.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir turma");
      }

      toast({
        title: "Sucesso",
        children: "Turma excluída com sucesso!",
        variant: "default",
      });

      setIsDeleteClassModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
      toast({
        title: "Erro",
        children: "Erro ao excluir turma. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingClass(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-[#1E3A8A] rounded-lg shadow-sm p-4 sm:p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{school.name}</h1>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar Escola
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm break-words">
                {school.address}, {school.city} - {school.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{formatPhone(school.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Mail className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm break-words">{school.email}</span>
            </div>
            {school.website && (
              <div className="flex items-center gap-2 text-white/80">
                <Globe className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm break-words">{school.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto -mb-px scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("tab", tab.id);
                  router.push(`?${params.toString()}`);
                }}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-4 text-sm font-medium flex-shrink-0",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mt-6">
        {activeTab === "detalhes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Informações Básicas */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow border-0 h-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Informações Básicas
                  </h3>
                </div>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-xs font-semibold text-blue-600 mb-0.5">
                      Endereço
                    </dt>
                    <dd className="text-base font-medium text-blue-900 leading-tight break-words">
                      {school.address}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-blue-600 mb-0.5">
                      Cidade/Estado
                    </dt>
                    <dd className="text-base font-medium text-blue-900 leading-tight">
                      {school.city} - {school.state}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-blue-600 mb-0.5">
                      Telefone
                    </dt>
                    <dd className="text-base font-medium text-blue-900 leading-tight">
                      {formatPhone(school.phone)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-blue-600 mb-0.5">
                      Email
                    </dt>
                    <dd className="text-base font-medium text-blue-900 leading-tight break-words">
                      {school.email}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Gestor */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow border-0 h-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Gestor
                  </h3>
                </div>
                {school.gestor ? (
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-xs font-semibold text-purple-600 mb-0.5">
                        Nome
                      </dt>
                      <dd className="text-base font-medium text-purple-900 leading-tight break-words">
                        {school.gestor.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-purple-600 mb-0.5">
                        Email
                      </dt>
                      <dd className="text-base font-medium text-purple-900 leading-tight break-words">
                        {school.gestor.email}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-purple-600">
                      Nenhum gestor designado
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "professores" && (
          <div className="mt-4">
            <ProfessoresContent
              professoresIniciais={school.professors.map((p) => ({
                id: p.id,
                nome: p.name,
                email: p.email,
                escola: { id: school.id, nome: school.name },
              }))}
              escolas={[{ id: school.id, name: school.name }]}
            />
          </div>
        )}

        {activeTab === "turmas" && (
          <div className="space-y-6">
            {/* Cabeçalho da seção de turmas */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Turmas ({school.classes.length})
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Gerencie as turmas desta escola
                </p>
              </div>
            </div>

            {/* Barra de Pesquisa + Botão */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Buscar turmas por nome ou turno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                variant="primary"
                className="w-full sm:w-auto whitespace-nowrap cursor-pointer bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => setIsNewClassModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Turma
              </Button>
            </div>

            {/* Lista de turmas */}
            <Card>
              {filteredClasses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="hidden sm:table-header-group">
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>Turma</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Turno</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Alunos</span>
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
                      {filteredClasses.map((turma) => (
                        <tr
                          key={turma.id}
                          className="group transition-colors duration-150 hover:bg-purple-50/50"
                        >
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {turma.name}
                                </div>
                                <div className="sm:hidden mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    turma.period.toLowerCase() === 'manhã' || turma.period.toLowerCase() === 'matutino'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : turma.period.toLowerCase() === 'tarde' || turma.period.toLowerCase() === 'vespertino'
                                      ? 'bg-orange-100 text-orange-800'
                                      : turma.period.toLowerCase() === 'noite' || turma.period.toLowerCase() === 'noturno'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {turma.period}
                                  </span>
                                  <div className="mt-1 text-sm text-gray-500">
                                    {turma._count?.alunos || 0} alunos
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              turma.period.toLowerCase() === 'manhã' || turma.period.toLowerCase() === 'matutino'
                                ? 'bg-yellow-100 text-yellow-800'
                                : turma.period.toLowerCase() === 'tarde' || turma.period.toLowerCase() === 'vespertino'
                                ? 'bg-orange-100 text-orange-800'
                                : turma.period.toLowerCase() === 'noite' || turma.period.toLowerCase() === 'noturno'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {turma.period}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1.5" />
                              <span className="text-gray-900">{turma._count?.alunos || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewClass(turma.id)}
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Visualizar turma"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClass(turma.id)}
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Editar turma"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClass(turma.id)}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Excluir turma"
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
              ) : (
                <div className="text-center py-12 bg-white">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Nenhuma turma encontrada com os termos da busca"
                      : "Nenhuma turma cadastrada nesta escola"}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="primary"
                      className="mt-4 cursor-pointer"
                      onClick={() => setIsNewClassModalOpen(true)}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar primeira turma
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!isEditingSchool) {
            setIsEditModalOpen(false);
            setEditSchoolError(null);
          }
        }}
        title="Editar Escola"
        maxWidth="3xl"
        minHeight={modalHeight ? `${modalHeight}px` : undefined}
      >
        <SchoolForm
          school={schoolForForm}
          onSubmit={handleEditSchool}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditSchoolError(null);
          }}
          isSubmitting={isEditingSchool}
          error={editSchoolError}
          onHeightChange={setModalHeight}
        />
      </Modal>

      {/* Modal de Edição de Turma */}
      <Modal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        title="Editar Turma"
        maxWidth="2xl"
      >
        <div className="p-6">
          <ClassForm
            schools={[{ id: school.id, name: school.name }]}
            initialData={selectedClass}
            onSuccess={() => {
              setIsEditClassModalOpen(false);
              router.refresh();
              toast({
                title: "Sucesso",
                children: "Turma atualizada com sucesso!",
                variant: "default",
              });
            }}
            onCancel={() => setIsEditClassModalOpen(false)}
            hideBackButton
          />
        </div>
      </Modal>

      {/* Modal de Nova Turma */}
      <Modal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        title="Nova Turma"
        maxWidth="2xl"
      >
        <div className="p-6">
          <ClassForm
            schools={[{ id: school.id, name: school.name }]}
            initialData={null}
            onSuccess={() => {
              setIsNewClassModalOpen(false);
              router.refresh();
              toast({
                title: "Sucesso",
                children: "Turma criada com sucesso!",
                variant: "default",
              });
            }}
            onCancel={() => setIsNewClassModalOpen(false)}
            hideBackButton
          />
        </div>
      </Modal>

      {/* Modal de Exclusão de Turma */}
      <Modal
        isOpen={isDeleteClassModalOpen}
        onClose={() => !isDeletingClass && setIsDeleteClassModalOpen(false)}
        title="Excluir Turma"
        maxWidth="md"
      >
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja excluir a turma <strong>{selectedClass?.nome}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Esta ação não pode ser desfeita e todos os dados relacionados a esta turma serão perdidos.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              disabled={isDeletingClass}
              onClick={() => setIsDeleteClassModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingClass}
              onClick={confirmDeleteClass}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingClass ? "Excluindo..." : "Excluir Turma"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
