"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";

// Schema de validação
const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "SECRETARIA", "GESTOR", "PROFESSOR", "ALUNO"]),
  escolaId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface School {
  id: string;
  name: string;
}

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Observar o campo role para mostrar/esconder o campo de escola
  const role = watch("role");

  // Carregar lista de escolas quando o componente montar
  useEffect(() => {
    async function loadSchools() {
      try {
        const response = await fetch("/api/admin/schools");
        if (!response.ok) {
          throw new Error("Erro ao carregar escolas");
        }
        const data = await response.json();
        setSchools(data);
      } catch (err) {
        setError("Não foi possível carregar a lista de escolas");
        console.error("Erro ao buscar escolas:", err);
      }
    }

    loadSchools();
  }, []);

  // Atualizar o papel selecionado quando o campo role mudar
  useEffect(() => {
    setSelectedRole(role || "");
  }, [role]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Se for professor, validar se a escola foi selecionada
      if (data.role === "PROFESSOR" && !data.escolaId) {
        throw new Error("Selecione uma escola para o professor");
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar usuário");
      }

      router.push("/admin/usuarios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Novo Usuário</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Voltar
        </Button>
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
              Senha
            </label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium">
              Função
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="role" className={errors.role?.message ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="SECRETARIA">Secretaria</SelectItem>
                    <SelectItem value="GESTOR">Gestor</SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="ALUNO">Aluno</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role?.message && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {selectedRole === "PROFESSOR" && (
            <div className="space-y-2">
              <label htmlFor="escolaId" className="block text-sm font-medium">
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
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
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
          )}

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
              {isLoading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 