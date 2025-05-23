"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatarData } from "@/lib/utils/formatadores";
import type { AlunoWithRelations } from "@/lib/actions/aluno";

interface ModalEdicaoAlunoProps {
  aluno: AlunoWithRelations;
  secao: string | null;
  onClose: () => void;
  onSave: (data: Partial<AlunoWithRelations>) => Promise<void>;
}

// Schema de validação para informações básicas
const basicasSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  dataNascimento: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "Data inválida"
  ),
  cpf: z.string().min(11, "CPF inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória")
});

// Schema de validação para contato
const contatoSchema = z.object({
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  endereco: z.string().min(5, "Endereço inválido"),
  cidade: z.string().min(2, "Cidade inválida"),
  estado: z.string().length(2, "Estado inválido"),
  cep: z.string().min(8, "CEP inválido")
});

// Schema de validação para turma
const turmaSchema = z.object({
  turmaId: z.string().min(1, "Turma é obrigatória")
});

// Schema de validação para informações adicionais
const adicionaisSchema = z.object({
  situacao: z.enum(["ATIVO", "INATIVO", "TRANSFERIDO", "EVADIDO"]),
  dataMatricula: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "Data inválida"
  )
});

type BasicasFormData = z.infer<typeof basicasSchema>;
type ContatoFormData = z.infer<typeof contatoSchema>;
type TurmaFormData = z.infer<typeof turmaSchema>;
type AdicionaisFormData = z.infer<typeof adicionaisSchema>;

export function ModalEdicaoAluno({ aluno, secao, onClose, onSave }: ModalEdicaoAlunoProps) {
  const basicasForm = useForm<BasicasFormData>({
    resolver: zodResolver(basicasSchema),
    defaultValues: {
      nome: aluno.user.name,
      dataNascimento: new Date(aluno.dataNascimento).toISOString().split("T")[0],
      cpf: aluno.cpf,
      matricula: aluno.matricula
    }
  });

  const contatoForm = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      email: aluno.user.email,
      telefone: aluno.telefone,
      endereco: aluno.endereco,
      cidade: aluno.cidade,
      estado: aluno.estado,
      cep: aluno.cep
    }
  });

  const turmaForm = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      turmaId: aluno.turmas[0]?.turma.id || ""
    }
  });

  const adicionaisForm = useForm<AdicionaisFormData>({
    resolver: zodResolver(adicionaisSchema),
    defaultValues: {
      situacao: aluno.situacao,
      dataMatricula: new Date(aluno.dataMatricula).toISOString().split("T")[0]
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await onSave(data);
      onClose();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  const renderForm = () => {
    switch (secao) {
      case "basicas":
        return (
          <form onSubmit={basicasForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                {...basicasForm.register("nome")}
                error={basicasForm.formState.errors.nome?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                {...basicasForm.register("dataNascimento")}
                error={basicasForm.formState.errors.dataNascimento?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                {...basicasForm.register("cpf")}
                error={basicasForm.formState.errors.cpf?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                {...basicasForm.register("matricula")}
                error={basicasForm.formState.errors.matricula?.message}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        );

      case "contato":
        return (
          <form onSubmit={contatoForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...contatoForm.register("email")}
                error={contatoForm.formState.errors.email?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...contatoForm.register("telefone")}
                error={contatoForm.formState.errors.telefone?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...contatoForm.register("endereco")}
                error={contatoForm.formState.errors.endereco?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...contatoForm.register("cidade")}
                  error={contatoForm.formState.errors.cidade?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  {...contatoForm.register("estado")}
                  error={contatoForm.formState.errors.estado?.message}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...contatoForm.register("cep")}
                error={contatoForm.formState.errors.cep?.message}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        );

      case "turma":
        return (
          <form onSubmit={turmaForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="turmaId">Turma</Label>
              <Select
                id="turmaId"
                {...turmaForm.register("turmaId")}
                error={turmaForm.formState.errors.turmaId?.message}
              >
                <option value="">Selecione uma turma</option>
                {/* Aqui você precisará carregar as turmas disponíveis */}
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        );

      case "adicionais":
        return (
          <form onSubmit={adicionaisForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <Select
                id="situacao"
                {...adicionaisForm.register("situacao")}
                error={adicionaisForm.formState.errors.situacao?.message}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="TRANSFERIDO">Transferido</option>
                <option value="EVADIDO">Evadido</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataMatricula">Data de Matrícula</Label>
              <Input
                id="dataMatricula"
                type="date"
                {...adicionaisForm.register("dataMatricula")}
                error={adicionaisForm.formState.errors.dataMatricula?.message}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={!!secao} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {secao === "basicas" && "Editar Informações Básicas"}
            {secao === "contato" && "Editar Contato"}
            {secao === "turma" && "Editar Turma"}
            {secao === "adicionais" && "Editar Informações Adicionais"}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
} 