"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  dataNascimento: string;
  turma: Turma | null;
}

interface ModalAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  aluno?: Aluno;
}

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

export function ModalAluno({ isOpen, onClose, onSuccess, aluno }: ModalAlunoProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      nome: aluno?.nome || "",
      email: aluno?.email || "",
      dataNascimento: aluno?.dataNascimento
        ? new Date(aluno.dataNascimento).toISOString().split("T")[0]
        : "",
      turmaId: aluno?.turma?.id || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchTurmas();
      if (aluno) {
        reset({
          nome: aluno.nome,
          email: aluno.email,
          dataNascimento: new Date(aluno.dataNascimento)
            .toISOString()
            .split("T")[0],
          turmaId: aluno.turma?.id || "",
        });
      } else {
        reset({
          nome: "",
          email: "",
          dataNascimento: "",
          turmaId: "",
        });
      }
    }
  }, [isOpen, aluno, reset]);

  const fetchTurmas = async () => {
    try {
      const response = await fetch("/api/gestor/turmas");
      if (!response.ok) {
        throw new Error("Erro ao carregar turmas");
      }
      const data = await response.json();
      setTurmas(data);
    } catch (err) {
      setError("Erro ao carregar turmas");
      console.error(err);
    }
  };

  const onSubmit = async (data: AlunoFormData) => {
    try {
      setLoading(true);
      setError(null);

      const url = aluno
        ? `/api/gestor/alunos/${aluno.id}`
        : "/api/gestor/alunos";
      const method = aluno ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar aluno");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={aluno ? "Editar Aluno" : "Novo Aluno"}
      description={
        aluno
          ? "Atualize as informações do aluno"
          : "Preencha os dados para cadastrar um novo aluno"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700"
          >
            Nome
          </label>
          <Input
            id="nome"
            type="text"
            {...register("nome")}
            error={errors.nome?.message}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label
            htmlFor="dataNascimento"
            className="block text-sm font-medium text-gray-700"
          >
            Data de Nascimento
          </label>
          <Input
            id="dataNascimento"
            type="date"
            {...register("dataNascimento")}
            error={errors.dataNascimento?.message}
          />
        </div>

        <div>
          <label
            htmlFor="turmaId"
            className="block text-sm font-medium text-gray-700"
          >
            Turma
          </label>
          <select
            id="turmaId"
            {...register("turmaId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A] sm:text-sm"
          >
            <option value="">Selecione uma turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome} ({turma.codigo} -{" "}
                {turma.turno === "MATUTINO"
                  ? "Matutino"
                  : turma.turno === "VESPERTINO"
                  ? "Vespertino"
                  : "Noturno"}
                )
              </option>
            ))}
          </select>
          {errors.turmaId && (
            <p className="mt-1 text-sm text-red-600">{errors.turmaId.message}</p>
          )}
        </div>

        {!aluno && (
          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              {...register("senha")}
              error={errors.senha?.message}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {aluno ? "Salvar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 