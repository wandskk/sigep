"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, User, Mail, Phone, MapPin, GraduationCap, School } from "lucide-react";
import { useRouter } from "next/navigation";

interface AlunoDetailsClientProps {
  aluno: any;
  isAdmin?: boolean;
}

export function AlunoDetailsClient({ aluno, isAdmin = false }: AlunoDetailsClientProps) {
  const router = useRouter();

  const formatarData = (data: string | Date) => {
    if (typeof data === "string") {
      return new Date(data).toLocaleDateString("pt-BR");
    }
    return data.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/alunos")}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista de Alunos
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{aluno.user.name}</h1>
          <p className="text-gray-500">Matrícula: {aluno.matricula}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Informações Pessoais</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome Completo</label>
              <p className="text-gray-900">{aluno.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{aluno.user.email || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
              <p className="text-gray-900">
                {aluno.dataNascimento ? formatarData(aluno.dataNascimento) : "Não informado"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Informações Acadêmicas</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Matrícula</label>
              <p className="text-gray-900">{aluno.matricula}</p>
            </div>
            {aluno.turmas && aluno.turmas.length > 0 && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Turma</label>
                  <p className="text-gray-900">{aluno.turmas[0].turma.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Escola</label>
                  <p className="text-gray-900">{aluno.turmas[0].turma.escola.name}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {aluno.responsaveis && aluno.responsaveis.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Responsáveis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aluno.responsaveis.map((responsavel: any, index: number) => (
              <div key={responsavel.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{responsavel.nome}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Email: {responsavel.email}</p>
                  <p>Telefone: {responsavel.telefone}</p>
                  <p>Parentesco: {responsavel.parentesco}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 