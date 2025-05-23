import { Aluno, Turma } from "@prisma/client";

export type AlunoFormatado = {
  id: string;
  nome: string;
  matricula: string;
  email: string | null;
  turma?: {
    id: string;
    nome: string;
    turno: string;
  };
};

export function formatarAlunos(alunos: (Aluno & { turmas: Turma[] })[]): AlunoFormatado[] {
  return alunos.map((aluno) => ({
    id: aluno.id,
    nome: aluno.userId,
    matricula: aluno.matricula,
    email: aluno.email,
    turma: aluno.turmas[0] ? {
      id: aluno.turmas[0].id,
      nome: aluno.turmas[0].nome,
      turno: aluno.turmas[0].turno,
    } : undefined,
  }));
} 