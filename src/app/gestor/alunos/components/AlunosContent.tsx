"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { TabelaAlunos } from "@/components/tables/TabelaAlunos";
import { ModalAluno } from "./ModalAluno";
import { BuscaAlunos } from "./BuscaAlunos";
import { Loader } from "@/components/ui/Loader";
import type { AlunoFormatado } from "@/components/tables/TabelaAlunos";

interface AlunosContentProps {
  alunosIniciais: AlunoFormatado[];
  escolaId: string;
}

export function AlunosContent({ alunosIniciais, escolaId }: AlunosContentProps) {
  const [alunos, setAlunos] = useState<AlunoFormatado[]>(alunosIniciais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAlunos(alunosIniciais);
  }, [alunosIniciais]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader 
          size="lg" 
          variant="primary" 
          text="Carregando alunos..." 
        />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-6">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#374151]">Alunos</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Gerencie os alunos da sua escola
          </p>
        </div>
        <ModalAluno escolaId={escolaId} />
      </div>

      <BuscaAlunos />

      <TabelaAlunos
        alunos={alunos}
        showTurma
        emptyMessage={
          alunos.length === 0
            ? "Nenhum aluno cadastrado. Clique em 'Novo Aluno' para começar."
            : "Nenhum aluno encontrado com os critérios de busca."
        }
      />
    </>
  );
} 