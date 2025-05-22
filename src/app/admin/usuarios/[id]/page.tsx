"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useState, useEffect, use } from "react";

// Schema de validação
const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")), // Permite string vazia
  role: z.enum(["ADMIN", "SECRETARIA", "GESTOR", "PROFESSOR", "ALUNO"]),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const resolvedParams = use(params);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Carregar dados do usuário
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`/api/admin/users/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Usuário não encontrado");
        }
        const user = await response.json();
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar usuário");
      } finally {
        setIsLoadingUser(false);
      }
    }

    loadUser();
  }, [resolvedParams.id, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Se a senha estiver vazia, removê-la do payload
      const payload = data.password
        ? data
        : { name: data.name, email: data.email, role: data.role };

      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar usuário");
      }

      router.push("/admin/usuarios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir usuário");
      }

      router.push("/admin/usuarios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
        <Card>
          <div className="p-6">
            <p className="text-gray-500">Carregando dados do usuário...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Usuário</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <Button
            variant="error"
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
          >
            Excluir
          </Button>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {error && (
            <Alert variant="error" title="Erro">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nome
            </label>
            <Input
              id="name"
              {...register("name")}
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Nova Senha (opcional)
            </label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
            <p className="text-sm text-gray-500">
              Deixe em branco para manter a senha atual
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium">
              Função
            </label>
            <Select
              id="role"
              {...register("role")}
              error={errors.role?.message}
            >
              <option value="">Selecione uma função</option>
              <option value="ADMIN">Administrador</option>
              <option value="SECRETARIA">Secretaria</option>
              <option value="GESTOR">Gestor</option>
              <option value="PROFESSOR">Professor</option>
              <option value="ALUNO">Aluno</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 