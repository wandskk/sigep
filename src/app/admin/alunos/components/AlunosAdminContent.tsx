"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { TabelaAlunos } from "@/components/tables/TabelaAlunos";
import { BuscaAlunos } from "./BuscaAlunos";
import { Loader } from "@/components/ui/Loader";
import type { AlunoFormatado } from "@/components/tables/TabelaAlunos";

interface AlunosAdminContentProps {
  alunosIniciais: AlunoFormatado[];
}

export function AlunosAdminContent({ alunosIniciais }: AlunosAdminContentProps) {
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
          <h1 className="text-3xl font-bold text-gray-900">Todos os Alunos</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Visualize e gerencie todos os alunos cadastrados no sistema
          </p>
        </div>
      </div>

      <BuscaAlunos />

      <TabelaAlunos
        alunos={alunos}
        showTurma
        showEscola
        isAdmin
        emptyMessage={
          alunos.length === 0
            ? "Nenhum aluno cadastrado no sistema."
            : "Nenhum aluno encontrado com os critérios de busca."
        }
      />
    </>
  );
} 