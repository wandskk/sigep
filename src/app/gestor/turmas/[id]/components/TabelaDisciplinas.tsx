"use client";

import { Button } from "@/components/ui/Button";
import { UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";

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
        <p className="text-gray-500">
          Esta turma ainda não possui disciplinas. Clique em "Adicionar Disciplinas" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
            <tr key={disciplina.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {disciplina.nome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {disciplina.professor?.nome || "Não atribuído"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                {disciplina.professor ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAtribuirProfessor(disciplina.id, disciplina.nome)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1"
                  >
                    <UserIcon className="h-4 w-4" />
                    Alterar Professor
                  </Button>
                ) : (
                  <Button
                    variant="success"
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
                  variant="danger"
                  size="sm"
                  onClick={() => onRemoverDisciplina(disciplina.id, disciplina.nome)}
                  disabled={isSubmitting}
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 