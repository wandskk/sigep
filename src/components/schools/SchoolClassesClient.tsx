"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  PencilIcon,
  TrashIcon,
  Plus,
  Search,
  GraduationCap,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Turno } from "@prisma/client";
import Link from "next/link";

interface Professor {
  id: string;
  name: string;
  email: string;
}

interface Aluno {
  id: string;
  name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
  turno: Turno;
  professores: Professor[];
  alunos: Aluno[];
}

interface SchoolClassesClientProps {
  school: {
    id: string;
    name: string;
    classes: Class[];
  };
}

export function SchoolClassesClient({ school }: SchoolClassesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurno, setSelectedTurno] = useState<Turno | "TODOS">("TODOS");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const base = `/admin/escolas/${school.id}/turmas`;

  const filteredClasses = school.classes.filter((turma) => {
    const matchesSearch =
      turma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno =
      selectedTurno === "TODOS" || turma.turno === selectedTurno;
    return matchesSearch && matchesTurno;
  });

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(
        `/api/admin/schools/${school.id}/classes/${classToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir turma");
      }

      setSuccess("Turma excluída com sucesso");
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao excluir turma"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de pesquisa, filtros e botão de adicionar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Buscar turmas por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={selectedTurno}
          onChange={(e) => setSelectedTurno(e.target.value as Turno | "TODOS")}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 w-[180px]"
        >
          <option value="TODOS">Todos os turnos</option>
          <option value="MATUTINO">Matutino</option>
          <option value="VESPERTINO">Vespertino</option>
          <option value="NOTURNO">Noturno</option>
        </select>
        <Link href={`/admin/escolas/${school.id}/turmas/nova`}>
          <Button variant="primary" className="w-full sm:w-auto cursor-pointer whitespace-nowrap">
            <Plus className="h-5 w-5 mr-2" />
            Nova Turma
          </Button>
        </Link>
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

      {/* Lista de turmas */}
      <Card className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="overflow-x-auto px-6 py-5">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span>Turma</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((turma) => (
                <tr
                  key={turma.id}
                  className={cn(
                    "group transition-colors duration-150 hover:bg-blue-50/50",
                    isDeleting &&
                      classToDelete?.id === turma.id &&
                      "opacity-50 pointer-events-none"
                  )}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {turma.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Código: {turma.code} • Turno:{" "}
                          {turma.turno.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/admin/turmas/${turma.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                          title="Visualizar turma"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setClassToDelete(turma);
                          setIsDeleteModalOpen(true);
                        }}
                        disabled={isDeleting && classToDelete?.id === turma.id}
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

        {filteredClasses.length === 0 && (
          <div className="text-center px-6 py-12">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || selectedTurno !== "TODOS"
                ? "Nenhuma turma encontrada com os filtros selecionados"
                : "Nenhuma turma cadastrada"}
            </p>
            {!searchTerm && selectedTurno === "TODOS" && (
              <Link href={`/admin/escolas/${school.id}/turmas/nova`}>
                <Button variant="primary" className="mt-4 cursor-pointer">
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar primeira turma
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Confirmar Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setClassToDelete(null);
          }
        }}
        title="Confirmar Exclusão"
        maxWidth="md"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-600">
            Tem certeza que deseja excluir a turma{" "}
            <span className="font-semibold">{classToDelete?.name}</span>? Esta
            ação não pode ser desfeita.
          </p>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setClassToDelete(null);
              }}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteClass}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? "Excluindo..." : "Excluir Turma"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
