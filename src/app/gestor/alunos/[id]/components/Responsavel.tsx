"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PatternFormat } from "react-number-format";
import { formatarCPF, formatarTelefone, formatarEmail } from "@/lib/utils/formatadores";
import { validarCPF } from "@/lib/utils/validadores";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  FileText, 
  Plus, 
  Pencil, 
  Trash2,
  AlertCircle,
  Users,
  MapPin
} from "lucide-react";
import { $Enums } from "@prisma/client";

interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  parentesco: $Enums.Parentesco;
  endereco: string;
  alunoId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ResponsavelProps {
  alunoId: string;
}

// Schema de validação
const responsavelSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string()
    .transform(val => val.replace(/\D/g, ""))
    .refine(
      (val) => val.length === 11,
      "CPF deve ter 11 dígitos"
    )
    .refine(
      (val) => !/^(\d)\1{10}$/.test(val),
      "CPF não pode ter todos os dígitos iguais"
    )
    .refine(
      validarCPF,
      "CPF inválido - verifique os dígitos verificadores"
    ),
  email: z.string().email("Email inválido"),
  telefone: z.string()
    .transform(val => val.replace(/\D/g, ""))
    .refine(
      (val) => val.length === 11,
      "Telefone deve ter 11 dígitos (DDD + número)"
    )
    .refine(
      (val) => /^[1-9]\d{10}$/.test(val),
      "Telefone inválido - deve começar com DDD válido"
    ),
  parentesco: z.nativeEnum($Enums.Parentesco),
  endereco: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
});

type ResponsavelFormData = z.infer<typeof responsavelSchema>;

export function Responsavel({ alunoId }: ResponsavelProps) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [modalAberto, setModalAberto] = useState<"criar" | "editar" | null>(null);
  const [responsavelEditando, setResponsavelEditando] = useState<Responsavel | null>(null);
  const [carregando, setCarregando] = useState(true);

  const form = useForm<ResponsavelFormData>({
    resolver: zodResolver(responsavelSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      parentesco: $Enums.Parentesco.PAI,
      endereco: "",
    },
  });

  // Carregar responsáveis
  const carregarResponsaveis = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/alunos/${alunoId}/responsaveis`);
      if (!response.ok) throw new Error("Erro ao carregar responsável");
      const data = await response.json();
      setResponsaveis(data);
    } catch (error) {
      toast.error("Erro ao carregar responsável");
    } finally {
      setCarregando(false);
    }
  };

  // Carregar responsáveis ao montar o componente
  useEffect(() => {
    carregarResponsaveis();
  }, [alunoId]);

  // Criar responsável
  const criarResponsavel = async (data: ResponsavelFormData) => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/alunos/${alunoId}/responsaveis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao criar responsável");
      
      toast.success("Responsável criado com sucesso!");
      setModalAberto(null);
      form.reset();
      carregarResponsaveis();
    } catch (error) {
      toast.error("Erro ao criar responsável");
    } finally {
      setCarregando(false);
    }
  };

  // Editar responsável
  const editarResponsavel = async (data: ResponsavelFormData) => {
    if (!responsavelEditando) return;

    try {
      setCarregando(true);
      const response = await fetch(`/api/responsaveis/${responsavelEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao editar responsável");
      
      toast.success("Responsável atualizado com sucesso!");
      setModalAberto(null);
      setResponsavelEditando(null);
      form.reset();
      carregarResponsaveis();
    } catch (error) {
      toast.error("Erro ao editar responsável");
    } finally {
      setCarregando(false);
    }
  };

  // Excluir responsável
  const excluirResponsavel = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este responsável?")) return;

    try {
      setCarregando(true);
      const response = await fetch(`/api/responsaveis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir responsável");
      
      toast.success("Responsável excluído com sucesso!");
      carregarResponsaveis();
    } catch (error) {
      toast.error("Erro ao excluir responsável");
    } finally {
      setCarregando(false);
    }
  };

  // Abrir modal de edição
  const abrirModalEdicao = (responsavel: Responsavel) => {
    setResponsavelEditando(responsavel);
    form.reset({
      nome: responsavel.nome,
      cpf: formatarCPF(responsavel.cpf),
      email: responsavel.email,
      telefone: formatarTelefone(responsavel.telefone),
      parentesco: responsavel.parentesco,
      endereco: responsavel.endereco,
    });
    setModalAberto("editar");
  };

  // Renderizar formulário
  const renderFormulario = () => (
    <form 
      onSubmit={form.handleSubmit(modalAberto === "criar" ? criarResponsavel : editarResponsavel)} 
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          id="nome"
          {...form.register("nome")}
          error={form.formState.errors.nome?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <PatternFormat
          format="###.###.###-##"
          mask="_"
          customInput={Input}
          id="cpf"
          value={form.watch("cpf")}
          onValueChange={(values) => {
            const cpf = values.value;
            const cpfSemMascara = cpf.replace(/\D/g, "");
            form.setValue("cpf", cpf, { 
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          }}
          onBlur={() => {
            form.trigger("cpf");
          }}
          error={form.formState.errors.cpf?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <PatternFormat
          format="(##) #####-####"
          mask="_"
          customInput={Input}
          id="telefone"
          value={form.watch("telefone")}
          onValueChange={(values) => {
            const telefone = values.value;
            const telefoneSemMascara = telefone.replace(/\D/g, "");
            form.setValue("telefone", telefone, { 
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          }}
          onBlur={() => {
            form.trigger("telefone");
          }}
          error={form.formState.errors.telefone?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          {...form.register("endereco")}
          error={form.formState.errors.endereco?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentesco">Parentesco</Label>
        <Select
          id="parentesco"
          {...form.register("parentesco")}
          error={form.formState.errors.parentesco?.message}
        >
          <option value={$Enums.Parentesco.PAI}>Pai</option>
          <option value={$Enums.Parentesco.MAE}>Mãe</option>
          <option value={$Enums.Parentesco.AVO}>Avô/Avó</option>
          <option value={$Enums.Parentesco.OUTRO}>Outro</option>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setModalAberto(null);
            setResponsavelEditando(null);
            form.reset();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );

  // Renderizar card de responsável
  const renderResponsavelCard = (responsavel: Responsavel) => (
    <Card key={responsavel.id} className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <UserCircle className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">{responsavel.nome}</h3>
            <p className="text-sm text-blue-600 font-medium">{responsavel.parentesco}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => abrirModalEdicao(responsavel)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => excluirResponsavel(responsavel.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">CPF</p>
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>{formatarCPF(responsavel.cpf)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{formatarEmail(responsavel.email)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>{formatarTelefone(responsavel.telefone)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Endereço</p>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{responsavel.endereco}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Data de Cadastro</p>
              <p className="text-gray-700">{new Date(responsavel.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Última Atualização</p>
              <p className="text-gray-700">{new Date(responsavel.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Responsável</h2>
        </div>
        {responsaveis.length === 0 && (
          <Button
            onClick={() => {
              setModalAberto("criar");
              form.reset();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Responsável
          </Button>
        )}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : responsaveis.length > 0 ? (
        <div className="grid gap-4">
          {responsaveis.map(renderResponsavelCard)}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Nenhum responsável cadastrado</p>
        </div>
      )}

      <Dialog open={modalAberto !== null} onOpenChange={() => setModalAberto(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {modalAberto === "criar" ? "Adicionar Responsável" : "Editar Responsável"}
            </DialogTitle>
          </DialogHeader>
          {renderFormulario()}
        </DialogContent>
      </Dialog>
    </div>
  );
} 