"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { ROLE_DISPLAY_NAMES } from "@/lib/constants/auth";
import { cn } from "@/lib/utils";
import { Dialog } from "@headlessui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Container } from "@/components/layout/Container";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("TODOS");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Não foi possível carregar a lista de usuários");
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user?.role === UserRole.ADMIN) {
      fetchUsers();
    }
  }, [session]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir usuário");
      }

      // Atualizar a lista de usuários removendo o usuário excluído
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setSuccess("Usuário excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  const filteredUsers = users.filter(
    (user) =>
      (roleFilter === "TODOS" || user.role === roleFilter) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os usuários cadastrados no sistema
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
              placeholder="Buscar usuários por nome, email ou perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Perfis</SelectItem>
                {Object.entries(ROLE_DISPLAY_NAMES).map(([role, label]) => (
                  <SelectItem key={role} value={role}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="primary"
              onClick={() => router.push("/admin/usuarios/novo")}
              className="whitespace-nowrap cursor-pointer bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Cabeçalho da tabela - visível apenas em desktop */}
              <div className="hidden md:table-header-group">
                <div className="table-row bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Nome</span>
                    </div>
                  </div>
                  <div className="table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Email</span>
                    </div>
                  </div>
                  <div className="table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>Perfil</span>
                    </div>
                  </div>
                  <div className="table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Data de Cadastro</span>
                    </div>
                  </div>
                  <div className="table-cell px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </div>
                </div>
              </div>

              {/* Corpo da tabela */}
              <div className="table-row-group">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "table-row group transition-colors duration-150 hover:bg-blue-50/50",
                        isDeleting === user.id && "opacity-50 pointer-events-none"
                      )}
                    >
                      {/* Versão Desktop */}
                      <div className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {ROLE_DISPLAY_NAMES[user.role]}
                        </span>
                      </div>
                      <div className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/usuarios/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/usuarios/${user.id}`)}
                            disabled={isDeleting === user.id}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Editar usuário"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteModalOpen(true);
                            }}
                            disabled={isDeleting === user.id}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Excluir usuário"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Versão Mobile */}
                      <div className="md:hidden p-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {user.email}
                              </div>
                              <div className="mt-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {ROLE_DISPLAY_NAMES[user.role]}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Cadastrado em: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Link href={`/admin/usuarios/${user.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer p-2"
                                title="Ver detalhes"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/usuarios/${user.id}`)}
                              disabled={isDeleting === user.id}
                              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer p-2"
                              title="Editar usuário"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteModalOpen(true);
                              }}
                              disabled={isDeleting === user.id}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer p-2"
                              title="Excluir usuário"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-row">
                    <div className="table-cell col-span-5">
                      <div className="text-center py-12 bg-white">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchTerm
                            ? "Nenhum usuário encontrado com os termos da busca"
                            : "Nenhum usuário cadastrado"}
                        </p>
                        {!searchTerm && (
                          <Button
                            variant="primary"
                            onClick={() => router.push("/admin/usuarios/novo")}
                            className="mt-4 cursor-pointer"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Cadastrar primeiro usuário
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Modal de Confirmar Exclusão */}
        <Dialog
          open={isDeleteModalOpen}
          onClose={() => {
            if (!isSubmitting) {
              setIsDeleteModalOpen(false);
              setUserToDelete(null);
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
                Tem certeza que deseja excluir o usuário{" "}
                <span className="font-semibold">{userToDelete?.name}</span>?
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
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
                  {isSubmitting ? "Excluindo..." : "Excluir Usuário"}
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </Container>
  );
} 