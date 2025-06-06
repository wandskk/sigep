"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

const alunoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  dataNascimento: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Data de nascimento inválida",
  }),
  turmaId: z.string().optional(),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

interface FormAlunoProps {
  escolaId: string;
  onSuccess: () => void;
}

export function FormAluno({ escolaId, onSuccess }: FormAlunoProps) {
  const [turmas, setTurmas] = useState<{ id: string; nome: string; codigo: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
  });

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    try {
      const response = await fetch(`/api/turmas?escolaId=${escolaId}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar turmas");
      }
      const data = await response.json();
      setTurmas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar turmas");
    }
  };

  const onSubmit = async (data: AlunoFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/alunos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          escolaId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar aluno");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Input
          label="Nome"
          {...register("nome")}
          error={errors.nome?.message}
        />
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          label="Data de Nascimento"
          type="date"
          {...register("dataNascimento")}
          error={errors.dataNascimento?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="turmaId">Turma</Label>
        <Controller
          name="turmaId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome} ({turma.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.turmaId?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.turmaId.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Senha"
          type="password"
          {...register("senha")}
          error={errors.senha?.message}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" isLoading={loading}>
          Criar
        </Button>
      </div>
    </form>
  );
} 