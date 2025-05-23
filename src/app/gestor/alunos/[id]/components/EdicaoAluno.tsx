"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Info,
  Check,
  X,
  Users,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  formatarData,
  formatarCPF,
  formatarTelefone,
} from "@/lib/utils/formatadores";
import type { AlunoWithRelations } from "@/lib/actions/aluno";
import { useRouter } from "next/navigation";

interface EdicaoAlunoProps {
  aluno: AlunoWithRelations;
}

type AlunoField = keyof Omit<AlunoWithRelations, "user" | "turmas">;
type UserField = keyof AlunoWithRelations["user"];

interface DadosEditados {
  user?: Partial<AlunoWithRelations["user"]>;
  [key: string]: any;
}

const getUserField = (user: Partial<AlunoWithRelations["user"]> | undefined, field: string): string => {
  if (!user) return "";
  return (user[field as UserField] as string) ?? "";
};

const formatarValor = (valor: string | null | undefined): string => {
  if (!valor || valor.trim() === "") return "Não informado";
  return valor;
};

export function EdicaoAluno({ aluno }: EdicaoAlunoProps) {
  const [editando, setEditando] = useState<string | null>(null);
  const [dadosEditados, setDadosEditados] = useState<DadosEditados>({});
  const router = useRouter();

  const handleEdit = (secao: string) => {
    setEditando(secao);
    setDadosEditados({});
  };

  const handleCancel = () => {
    setEditando(null);
    setDadosEditados({});
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/alunos/${aluno.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosEditados),
      });

      if (!response.ok) throw new Error("Erro ao atualizar dados do aluno");

      const alunoAtualizado = await response.json();
      setEditando(null);
      setDadosEditados({});
      toast.success("Dados atualizados com sucesso!");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar dados do aluno");
    }
  };

  const handleChange = (campo: string, valor: string) => {
    if (campo.startsWith("user.")) {
      const userField = campo.split(".")[1] as UserField;
      setDadosEditados((prev) => ({
        ...prev,
        user: { ...prev.user, ...aluno.user, [userField]: valor },
      }));
    } else {
      const alunoField = campo.split(".")[1] as AlunoField;
      setDadosEditados((prev) => ({ ...prev, [alunoField]: valor }));
    }
  };

  if (!aluno) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Carregando dados do aluno...</p>
      </div>
    );
  }

  const renderCardHeader = (
    titulo: string,
    icone: React.ReactNode,
    secao: string
  ) => (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white shadow-sm">
          {icone}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
      </div>
      {editando === secao ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          >
            <Check className="w-4 h-4 mr-1" />
            Salvar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEdit(secao)}
          className="hover:bg-white/50"
        >
          Editar
        </Button>
      )}
    </div>
  );

  const renderCampo = (
    label: string,
    valor: string | null | undefined,
    campo: string,
    tipo: "text" | "date" | "email" | "tel" = "text"
  ) => (
    <div className="space-y-1.5 p-2 rounded-lg hover:bg-white/50 transition-colors">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {editando && campo.startsWith(editando) ? (
        <Input
          type={tipo}
          value={
            campo.startsWith("user.")
              ? getUserField(dadosEditados.user, campo.split(".")[1]) || valor || ""
              : dadosEditados[campo] ?? valor ?? ""
          }
          onChange={(e) => handleChange(campo, e.target.value)}
          className="w-full bg-white"
        />
      ) : (
        <p className="font-medium text-gray-700">{formatarValor(valor)}</p>
      )}
    </div>
  );

  const renderTurmaCard = () => {
    const turmaAtual = aluno.turmas[0]?.turma;
    const matricula = aluno.turmas[0];

    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        {renderCardHeader(
          "Turma Atual",
          <GraduationCap className="w-6 h-6 text-purple-600" />,
          "turma"
        )}
        {turmaAtual ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-2 rounded-lg hover:bg-white/50 transition-colors">
                <p className="text-sm font-medium text-gray-500">Nome da Turma</p>
                <p className="font-medium text-gray-700">{turmaAtual.nome}</p>
              </div>
              <div className="space-y-1.5 p-2 rounded-lg hover:bg-white/50 transition-colors">
                <p className="text-sm font-medium text-gray-500">Turno</p>
                <p className="font-medium text-gray-700">{turmaAtual.turno}</p>
              </div>
              <div className="space-y-1.5 p-2 rounded-lg hover:bg-white/50 transition-colors">
                <p className="text-sm font-medium text-gray-500">Data de Matrícula</p>
                <p className="font-medium text-gray-700">
                  {matricula?.createdAt ? formatarData(matricula.createdAt) : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/gestor/turmas/${turmaAtual.id}`)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Users className="w-4 h-4 mr-1" />
                Ver Turma
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-purple-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aluno não matriculado em nenhuma turma</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/gestor/turmas")}
              className="mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Matricular em uma Turma
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
        {renderCardHeader(
          "Informações Básicas",
          <UserCircle className="w-6 h-6 text-blue-600" />,
          "basicas"
        )}
        <div className="grid grid-cols-2 gap-4">
          {renderCampo("Nome Completo", aluno.user.name, "user.name")}
          {renderCampo(
            "Data de Nascimento",
            aluno.dataNascimento ? formatarData(aluno.dataNascimento) : null,
            "basicas.dataNascimento",
            "date"
          )}
          {renderCampo(
            "CPF",
            aluno.cpf ? formatarCPF(aluno.cpf) : null,
            "basicas.cpf"
          )}
          {renderCampo("Matrícula", aluno.matricula, "basicas.matricula")}
        </div>
      </Card>

      {/* Contato */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
        {renderCardHeader(
          "Contato",
          <Mail className="w-6 h-6 text-green-600" />,
          "contato"
        )}
        <div className="grid grid-cols-2 gap-6">
          {renderCampo("E-mail", aluno.user.email, "user.email", "email")}
          {renderCampo(
            "Telefone",
            aluno.telefone ? formatarTelefone(aluno.telefone) : null,
            "contato.telefone",
            "tel"
          )}
          {renderCampo("Endereço", aluno.endereco, "contato.endereco")}
          {renderCampo("Cidade", aluno.cidade, "contato.cidade")}
          {renderCampo("Estado", aluno.estado, "contato.estado")}
          {renderCampo("CEP", aluno.cep, "contato.cep")}
        </div>
      </Card>

      {/* Turma Atual */}
      {renderTurmaCard()}

      {/* Informações Adicionais */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
        {renderCardHeader(
          "Informações Adicionais",
          <Info className="w-6 h-6 text-orange-600" />,
          "adicionais"
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Situação</p>
            {editando === "adicionais" ? (
              <Select
                value={dadosEditados.situacao ?? aluno.situacao}
                onChange={(e) =>
                  handleChange("adicionais.situacao", e.target.value)
                }
                className="w-full bg-white"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="TRANSFERIDO">Transferido</option>
                <option value="EVADIDO">Evadido</option>
              </Select>
            ) : (
              <p className="font-medium text-gray-700">
                {aluno.situacao || "Não informado"}
              </p>
            )}
          </div>
          {renderCampo(
            "Data de Matrícula",
            aluno.dataMatricula ? formatarData(aluno.dataMatricula) : null,
            "adicionais.dataMatricula",
            "date"
          )}
        </div>
      </Card>
    </div>
  );
}
