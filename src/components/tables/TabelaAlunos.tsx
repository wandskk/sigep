"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export interface AlunoFormatado {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  dataNascimento: string | Date;
  turma?: {
    id: string;
    nome: string;
    codigo: string;
    turno?: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  } | null;
}

interface TabelaAlunosProps {
  alunos: AlunoFormatado[];
  showTurma?: boolean;
  emptyMessage?: string;
}

export function TabelaAlunos({
  alunos,
  showTurma = false,
  emptyMessage = "Nenhum aluno encontrado.",
}: TabelaAlunosProps) {
  const router = useRouter();

  if (alunos.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const getTurnoLabel = (turno: string) => {
    const turnos = {
      MATUTINO: "Matutino",
      VESPERTINO: "Vespertino",
      NOTURNO: "Noturno",
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  const formatarData = (data: string | Date) => {
    if (typeof data === "string") {
      return new Date(data).toLocaleDateString();
    }
    return data.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nome
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Matrícula
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Data de Nascimento
            </th>
            {showTurma && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Turma
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alunos.map((aluno) => (
            <tr key={aluno.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {aluno.nome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {aluno.matricula}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {aluno.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatarData(aluno.dataNascimento)}
              </td>
              {showTurma && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aluno.turma ? (
                    <span className="text-[#1E3A8A]">
                      {aluno.turma.nome} ({aluno.turma.codigo}
                      {aluno.turma.turno && ` - ${getTurnoLabel(aluno.turma.turno)}`})
                    </span>
                  ) : (
                    <span className="text-gray-400">Sem turma</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/gestor/alunos/${aluno.id}`)}
                >
                  Ver detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 