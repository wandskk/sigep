"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UserIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TurmaHeaderProps {
  turmaId: string;
  nome: string;
  escolaNome: string;
  escolaId: string;
  totalAlunos: number;
  totalProfessores: number;
  onOpenModalDisciplinas: () => void;
  onOpenModalExcluir: () => void;
}

export function TurmaHeader({
  turmaId,
  nome,
  escolaNome,
  escolaId,
  totalAlunos,
  totalProfessores,
  onOpenModalDisciplinas,
  onOpenModalExcluir,
}: TurmaHeaderProps) {
  const router = useRouter();
  const base = usePathname().split('/')[1];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{nome}</h1>
            <Link 
              href={`/${base}/escolas/${escolaId}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {escolaNome}
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <UserIcon className="h-5 w-5" />
              <span className="text-sm">
                <span className="font-medium">{totalAlunos}</span> alunos
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <UserIcon className="h-5 w-5" />
              <span className="text-sm">
                <span className="font-medium">{totalProfessores}</span> professores
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => router.push(`/gestor/turmas/${turmaId}/alunos`)}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <UserIcon className="h-5 w-5" />
            Gerenciar Alunos
          </Button>
          <Button
            onClick={onOpenModalDisciplinas}
            variant="primary"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Adicionar Disciplinas
          </Button>
          <Button
            onClick={onOpenModalExcluir}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-5 w-5" />
            Excluir Turma
          </Button>
        </div>
      </div>
    </div>
  );
} 