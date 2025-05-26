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

type UserField = "name" | "email";
type AlunoField = "dataNascimento" | "cpf" | "telefone" | "endereco" | "cidade" | "estado" | "cep";

interface DadosEditados {
  user?: Partial<AlunoWithRelations["user"]>;
  [key: string]: any;
}

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

  const renderCardHeader = (titulo: string, icone: React.ReactNode, secao: string) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icone}
        <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
      </div>
      <div className="flex items-center gap-2">
        {editando === secao ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Salvar
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(secao)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );

  const renderCampo = (
    label: string,
    valor: string | null,
    campo: string,
    tipo: string = "text"
  ) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {editando && campo.startsWith(editando) ? (
        <Input
          type={tipo}
          value={
            campo.startsWith("user.")
              ? dadosEditados.user?.[campo.split(".")[1] as UserField] || valor || ""
              : dadosEditados[campo.split(".")[1]] || valor || ""
          }
          onChange={(e) => handleChange(campo, e.target.value)}
          className="border-blue-200 focus:border-blue-500"
        />
      ) : (
        <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
          {valor || "Não informado"}
        </p>
      )}
    </div>
  );

  const renderTurmaCard = () => (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Turma Atual</h2>
        </div>
      </div>
      {aluno.turmas && aluno.turmas.length > 0 ? (
        <div className="space-y-4">
          {aluno.turmas.map((turmaAluno) => (
            <div
              key={turmaAluno.turma.id}
              className="bg-white rounded-lg p-4 border border-purple-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {turmaAluno.turma.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Código: {turmaAluno.turma.codigo}
                  </p>
                  <p className="text-sm text-gray-600">
                    Turno: {turmaAluno.turma.turno}
                  </p>
                  {turmaAluno.turma.escola && (
                    <p className="text-sm text-purple-600 font-medium">
                      {turmaAluno.turma.escola.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/turmas/${turmaAluno.turma.id}`)}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Ver Turma
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aluno não está matriculado em nenhuma turma</p>
        </div>
      )}
    </Card>
  );

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
    </div>
  );
} 