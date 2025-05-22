"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  turno: z.enum(["MATUTINO", "VESPERTINO", "NOTURNO"], {
    required_error: "Turno é obrigatório",
  }),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  escola: {
    id: string;
    nome: string;
  };
}

export default function EditarTurmaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.GESTOR) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === UserRole.GESTOR) {
      fetchTurma();
    }
  }, [session]);

  const fetchTurma = async () => {
    try {
      const response = await fetch(`/api/gestor/turmas/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/gestor/turmas");
          return;
        }
        throw new Error("Erro ao carregar turma");
      }

      const data = await response.json();
      setTurma(data);
      reset(data);
    } catch (err) {
      setError("Não foi possível carregar os dados da turma");
      console.error("Erro ao buscar turma:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TurmaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/gestor/turmas/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao atualizar turma");
      }

      const updatedTurma = await response.json();
      setTurma(updatedTurma);
      setSuccess("Turma atualizada com sucesso!");

      // Força uma atualização da página após 1 segundo
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar turma");
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

  if (!session || session.user.role !== UserRole.GESTOR) {
    return null;
  }

  if (!turma) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error">Turma não encontrada</Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">Editar Turma</h1>
            <Button
              variant="secondary"
              onClick={() => router.push("/gestor/turmas")}
            >
              Cancelar
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

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Input
                    label="Nome da Turma"
                    error={errors.nome?.message}
                    {...register("nome")}
                  />
                </div>

                <div>
                  <Select
                    label="Turno"
                    error={errors.turno?.message}
                    {...register("turno")}
                  >
                    <option value="">Selecione um turno</option>
                    <option value="MATUTINO">Matutino</option>
                    <option value="VESPERTINO">Vespertino</option>
                    <option value="NOTURNO">Noturno</option>
                  </Select>
                </div>

                <div className="text-sm text-[#6B7280]">
                  <p>
                    <span className="font-medium">Código:</span> {turma.codigo}
                  </p>
                  <p>
                    <span className="font-medium">Escola:</span> {turma.escola.nome}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/gestor/turmas")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 