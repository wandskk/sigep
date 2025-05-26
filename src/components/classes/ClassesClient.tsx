"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  School,
  Eye,
  PencilIcon,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import Link from "next/link";

interface School {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Aluno {
  id: string;
  user: User;
}

interface AlunoTurma {
  id: string;
  aluno: Aluno;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escolaId: string;
  createdAt: Date;
  updatedAt: Date;
  escola: School;
  alunos: AlunoTurma[];
}

interface ClassesClientProps {
  turmas: Turma[];
  escolas: School[];
}

const turnoBadge = {
  MATUTINO: "bg-yellow-100 text-yellow-800",
  VESPERTINO: "bg-orange-100 text-orange-800",
  NOTURNO: "bg-blue-100 text-blue-800",
};

export function ClassesClient({ turmas, escolas }: ClassesClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurno, setSelectedTurno] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<Turma | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    turno: "",
    escolaId: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredClasses = turmas.filter((turma) => {
    const matchesSearch =
      turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.escola.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = !selectedTurno || turma.turno === selectedTurno;
    return matchesSearch && matchesTurno;
  });

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      const response = await fetch(`/api/admin/turmas/${selectedClass.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao excluir turma");
      }
      setSuccess("Turma excluída com sucesso!");
      router.refresh();
    } catch (err) {
      setError("Erro ao excluir turma. Tente novamente.");
    } finally {
      setShowDeleteModal(false);
      setSelectedClass(null);
    }
  };

  const handleEdit = async () => {
    try {
      if (isCreating) {
        // Criar nova turma
        const response = await fetch("/api/admin/turmas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        });

        if (!response.ok) {
          throw new Error("Erro ao criar turma");
        }

        setSuccess("Turma criada com sucesso!");
      } else {
        // Editar turma existente
        if (!selectedClass) return;
        const response = await fetch(`/api/admin/turmas/${selectedClass.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar turma");
        }

        setSuccess("Turma atualizada com sucesso!");
      }

      router.refresh();
      setShowEditModal(false);
      setSelectedClass(null);
      setIsCreating(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao ${isCreating ? "criar" : "atualizar"} turma. Tente novamente.`
      );
    }
  };

  const resetForm = () => {
    setEditForm({
      nome: "",
      turno: "",
      escolaId: "",
    });
  };

  const openEditModal = (turma?: Turma) => {
    if (turma) {
      // Modo edição
      setSelectedClass(turma);
      setEditForm({
        nome: turma.nome,
        turno: turma.turno,
        escolaId: turma.escolaId,
      });
      setIsCreating(false);
    } else {
      // Modo criação
      setSelectedClass(null);
      resetForm();
      setIsCreating(true);
    }
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Turmas
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie todas as turmas cadastradas no sistema
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <div className="p-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedTurno}
            onChange={(e) => setSelectedTurno(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os turnos</option>
            <option value="MATUTINO">Matutino</option>
            <option value="VESPERTINO">Vespertino</option>
            <option value="NOTURNO">Noturno</option>
          </select>
          <Button
            className="ml-0 md:ml-2 w-full md:w-auto"
            onClick={() => openEditModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        {/* Versão Desktop - Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    TURMA
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-gray-400" />
                    ESCOLA
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    TURNO
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    ALUNOS
                  </div>
                </th>
                <th className="text-right p-4 font-semibold text-gray-500">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((turma) => (
                <tr key={turma.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-8 h-8 text-purple-400 bg-purple-100 rounded-full p-1" />
                      <span className="font-medium text-gray-900">
                        {turma.nome}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    {turma.escola?.id ? (
                      <Link
                        href={`/admin/escolas/${turma.escola.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {turma.escola.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        turnoBadge[turma.turno as keyof typeof turnoBadge] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {turma.turno.charAt(0) +
                        turma.turno.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {turma.alunos.length}{" "}
                        {turma.alunos.length === 1 ? "aluno" : "alunos"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/turmas/${turma.id}`)}
                        title="Visualizar"
                      >
                        <Eye className="w-5 h-5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(turma)}
                        title="Editar"
                      >
                        <Edit className="w-5 h-5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(turma);
                          setShowDeleteModal(true);
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile - Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredClasses.map((turma) => (
            <div key={turma.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-purple-400 bg-purple-100 rounded-full p-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{turma.nome}</h3>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <School className="w-4 h-4 mr-1.5 text-gray-400" />
                        {turma.escola?.id ? (
                          <Link
                            href={`/admin/escolas/${turma.escola.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {turma.escola.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </div>
                      <div className="flex items-center text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            turnoBadge[turma.turno as keyof typeof turnoBadge] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {turma.turno.charAt(0) +
                            turma.turno.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                        {turma.alunos.length}{" "}
                        {turma.alunos.length === 1 ? "aluno" : "alunos"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/turmas/${turma.id}`)}
                    title="Visualizar"
                    className="p-1"
                  >
                    <Eye className="w-5 h-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(turma)}
                    title="Editar"
                    className="p-1"
                  >
                    <Edit className="w-5 h-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedClass(turma);
                      setShowDeleteModal(true);
                    }}
                    title="Excluir"
                    className="p-1"
                  >
                    <Trash2 className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhuma turma encontrada com os termos da busca"
                : "Nenhuma turma cadastrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => router.push("/admin/turmas/nova")}
                className="mt-4 cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar primeira turma
              </Button>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p>
            Tem certeza que deseja excluir a turma "{selectedClass?.nome}"? Esta
            ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClass(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
          setIsCreating(false);
          resetForm();
        }}
        title={isCreating ? "Nova Turma" : "Editar Turma"}
      >
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome da Turma</Label>
              <Input
                id="nome"
                value={editForm.nome}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome da turma"
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition"
              />
            </div>

            {isCreating && (
              <div className="space-y-2">
                <Label htmlFor="escolaId" className="text-sm font-medium text-gray-700">Escola</Label>
                <select
                  id="escolaId"
                  value={editForm.escolaId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, escolaId: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-sm transition"
                >
                  <option value="">Selecione uma escola</option>
                  {escolas.map((escola) => (
                    <option key={escola.id} value={escola.id}>
                      {escola.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="turno" className="text-sm font-medium text-gray-700">Turno</Label>
              <select
                id="turno"
                value={editForm.turno}
                onChange={(e) => setEditForm((prev) => ({ ...prev, turno: e.target.value }))}
                className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-sm transition"
              >
                <option value="">Selecione um turno</option>
                <option value="MATUTINO">Matutino</option>
                <option value="VESPERTINO">Vespertino</option>
                <option value="NOTURNO">Noturno</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 pb-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedClass(null);
                setIsCreating(false);
                resetForm();
              }}
              className="rounded-lg border-gray-300 hover:bg-gray-100 px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 px-6 py-2"
            >
              {isCreating ? (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Turma
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
