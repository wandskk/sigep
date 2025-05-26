"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { ArrowLeft, Trash2, Plus, GraduationCap, School, Users, PencilIcon, Mail, UserIcon, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/Label";

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
  aluno: {
    id: string;
    user: User;
  };
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escola: School;
  alunos: Aluno[];
}

interface ClassDetailsClientProps {
  turma: Turma;
}

export function ClassDetailsClient({ turma }: ClassDetailsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: turma.nome,
    turno: turma.turno,
  });

  const filteredStudents = turma.alunos.filter((aluno) =>
    aluno.aluno.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.aluno.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(
        `/api/admin/schools/${turma.escola.id}/classes/${turma.id}/students?studentId=${selectedStudent.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover aluno da turma");
      }

      setSuccess("Aluno removido com sucesso!");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao remover aluno da turma"
      );
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/admin/turmas/${turma.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Erro ao atualizar turma");
      }
      
      setSuccess("Turma atualizada com sucesso!");
      setIsEditModalOpen(false);
      router.refresh();
    } catch (err) {
      setError("Erro ao atualizar turma. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-[#1E3A8A] rounded-lg shadow-sm p-4 md:p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-white/80" />
              <h1 className="text-xl md:text-2xl font-bold text-white">{turma.nome}</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar Turma
              </Button>
              <Link href="/admin/turmas" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-white/80 bg-white/5 p-3 rounded-lg">
              <School className="h-5 w-5" />
              <span className="text-sm">
                {turma.escola.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80 bg-white/5 p-3 rounded-lg">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm">Código: {turma.codigo}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 bg-white/5 p-3 rounded-lg">
              <Users className="h-5 w-5" />
              <span className="text-sm">Turno: {turma.turno}</span>
            </div>
          </div>
        </div>
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

      {/* Lista de Alunos */}
      <Card>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Alunos ({turma.alunos.length})
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie os alunos desta turma
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // TODO: Implementar adição de alunos
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar alunos por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Versão Desktop - Tabela */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      ALUNO
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      EMAIL
                    </div>
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-500">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((aluno) => (
                  <tr key={aluno.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          {aluno.aluno.user.image ? (
                            <Image
                              src={aluno.aluno.user.image}
                              alt={aluno.aluno.user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-500">
                              {aluno.aluno.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{aluno.aluno.user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">
                      {aluno.aluno.user.email}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/alunos/${aluno.aluno.id}`)}
                          title="Visualizar aluno"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedStudent(aluno);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Remover da turma"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão Mobile - Cards */}
          <div className="md:hidden space-y-4">
            {filteredStudents.map((aluno) => (
              <div key={aluno.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                    {aluno.aluno.user.image ? (
                      <Image
                        src={aluno.aluno.user.image}
                        alt={aluno.aluno.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 text-lg">
                        {aluno.aluno.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{aluno.aluno.user.name}</h3>
                    <p className="text-sm text-gray-500">{aluno.aluno.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => router.push(`/admin/alunos/${aluno.aluno.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setSelectedStudent(aluno);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm
                  ? "Nenhum aluno encontrado com os termos da busca"
                  : "Nenhum aluno cadastrado nesta turma"}
              </p>
              {!searchTerm && (
                <Button
                  variant="primary"
                  className="mt-4 cursor-pointer"
                  onClick={() => {
                    // TODO: Implementar adição de alunos
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar primeiro aluno
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Remoção */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Remover Aluno"
      >
        <div className="p-4 md:p-6">
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja remover o aluno{" "}
            <span className="font-semibold">{selectedStudent?.aluno.user.name}</span>{" "}
            desta turma?
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedStudent(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveStudent}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Turma"
      >
        <div className="space-y-6 p-4 md:p-6">
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
            <div className="space-y-2">
              <Label htmlFor="turno" className="text-sm font-medium text-gray-700">Turno</Label>
              <select
                id="turno"
                value={editForm.turno}
                onChange={(e) => setEditForm((prev) => ({ ...prev, turno: e.target.value }))}
                className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-sm transition"
              >
                <option value="MATUTINO">Matutino</option>
                <option value="VESPERTINO">Vespertino</option>
                <option value="NOTURNO">Noturno</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto rounded-lg border-gray-300 hover:bg-gray-100 px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 px-6 py-2"
            >
              <PencilIcon className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 