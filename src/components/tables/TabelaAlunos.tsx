"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { User, Eye, Calendar, GraduationCap, School } from "lucide-react";
import { Card } from "@/components/ui/Card";

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
    escola?: {
      id: string;
      name: string;
    };
  } | null;
}

interface TabelaAlunosProps {
  alunos: AlunoFormatado[];
  showTurma?: boolean;
  showEscola?: boolean;
  emptyMessage?: string;
  isAdmin?: boolean;
}

export function TabelaAlunos({
  alunos,
  showTurma = false,
  showEscola = false,
  emptyMessage = "Nenhum aluno encontrado.",
  isAdmin = false,
}: TabelaAlunosProps) {
  const router = useRouter();

  if (alunos.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl p-8 text-center border border-gray-100">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const formatarData = (data: string | Date) => {
    if (typeof data === "string") {
      return new Date(data).toLocaleDateString("pt-BR");
    }
    return data.toLocaleDateString("pt-BR");
  };

  // Componente de card para visualização mobile
  const AlunoCard = ({ aluno }: { aluno: AlunoFormatado }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {aluno.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{aluno.nome}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {formatarData(aluno.dataNascimento)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`${isAdmin ? '/admin' : '/gestor'}/alunos/${aluno.id}`)}
          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      
      {(showTurma || showEscola) && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {showTurma && aluno.turma && (
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{aluno.turma.nome}</span>
            </div>
          )}
          {showEscola && aluno.turma?.escola && (
            <div className="flex items-center text-sm">
              <School className="w-4 h-4 mr-2 flex-shrink-0 text-gray-600" />
              <button
                onClick={() => router.push(`/admin/escolas/${aluno.turma?.escola?.id}`)}
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
              >
                {aluno.turma.escola.name}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Visualização Desktop */}
      <div className="hidden md:block bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ALUNO
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATA DE NASCIMENTO
                </th>
                {showTurma && (
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TURMA
                  </th>
                )}
                {showEscola && (
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ESCOLA
                  </th>
                )}
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alunos.map((aluno) => (
                <tr 
                  key={aluno.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900">{aluno.nome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatarData(aluno.dataNascimento)}
                  </td>
                  {showTurma && (
                    <td className="px-6 py-4">
                      {aluno.turma ? (
                        <div className="text-sm font-medium text-gray-900">
                          {aluno.turma.nome}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  )}
                  {showEscola && (
                    <td className="px-6 py-4 text-sm">
                      {aluno.turma?.escola ? (
                        <button
                          onClick={() => router.push(`/admin/escolas/${aluno.turma?.escola?.id}`)}
                          className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                        >
                          {aluno.turma.escola.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`${isAdmin ? '/admin' : '/gestor'}/alunos/${aluno.id}`)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {alunos.map((aluno) => (
          <AlunoCard key={aluno.id} aluno={aluno} />
        ))}
      </div>
    </div>
  );
} 