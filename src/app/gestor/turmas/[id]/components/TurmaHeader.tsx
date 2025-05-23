"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UserIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TurmaHeaderProps {
  turmaId: string;
  nome: string;
  totalAlunos: number;
  totalProfessores: number;
  onOpenModalDisciplinas: () => void;
  onOpenModalExcluir: () => void;
}

export function TurmaHeader({
  turmaId,
  nome,
  totalAlunos,
  totalProfessores,
  onOpenModalDisciplinas,
  onOpenModalExcluir,
}: TurmaHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#374151]">{nome}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {totalAlunos} alunos • {totalProfessores} professores
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => router.push(`/gestor/turmas/${turmaId}/alunos`)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <UserIcon className="h-5 w-5" />
          Ver Alunos
        </Button>
        <Button
          onClick={onOpenModalDisciplinas}
          variant="outline"
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
  );
} 