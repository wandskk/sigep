"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface TurmaAluno {
  id: string;
  nome: string;
  codigo: string;
}

interface TabelaTurmasAlunoProps {
  turmas: TurmaAluno[];
}

export function TabelaTurmasAluno({ turmas }: TabelaTurmasAlunoProps) {
  if (turmas.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <p className="text-gray-500">
          Aluno não está matriculado em nenhuma turma.
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
              Nome da Turma
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Código
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
          {turmas.map((turma) => (
            <tr key={turma.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {turma.nome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {turma.codigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-600 hover:text-blue-900 p-0"
                  onClick={() => window.location.href = `/gestor/turmas/${turma.id}`}
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