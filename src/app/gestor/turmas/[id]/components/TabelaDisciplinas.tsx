"use client";

import { Button } from "@/components/ui/Button";
import { UserIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Disciplina {
  id: string;
  nome: string;
  professor: {
    id: string;
    nome: string;
  } | null;
}

interface TabelaDisciplinasProps {
  disciplinas: Disciplina[];
  onAtribuirProfessor: (disciplinaId: string, disciplinaNome: string) => void;
  onRemoverDisciplina: (disciplinaId: string, disciplinaNome: string) => void;
  isSubmitting: boolean;
}

export function TabelaDisciplinas({
  disciplinas,
  onAtribuirProfessor,
  onRemoverDisciplina,
  isSubmitting,
}: TabelaDisciplinasProps) {
  if (disciplinas.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="rounded-full bg-gray-50 p-3 w-12 h-12 mx-auto mb-4">
            <PlusIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma disciplina adicionada</h3>
          <p className="text-gray-500 text-sm mb-4">
            Esta turma ainda não possui disciplinas. Clique em "Adicionar Disciplinas" para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Disciplinas da Turma</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie as disciplinas e professores atribuídos a esta turma
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Disciplina
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Professor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disciplinas.map((disciplina) => (
              <tr key={disciplina.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{disciplina.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {disciplina.professor ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-900">{disciplina.professor.nome}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Não atribuído
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                  {disciplina.professor ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAtribuirProfessor(disciplina.id, disciplina.nome)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 bg-white hover:bg-gray-50"
                    >
                      <UserIcon className="h-4 w-4" />
                      Alterar Professor
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAtribuirProfessor(disciplina.id, disciplina.nome)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      Atribuir Professor
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoverDisciplina(disciplina.id, disciplina.nome)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 