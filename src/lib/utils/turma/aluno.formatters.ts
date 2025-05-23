import { TurmaWithAlunos } from "@/lib/actions/turma/turma.actions";

/**
 * Tipo que representa um aluno formatado
 */
export interface AlunoFormatado {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  dataNascimento: Date;
}

/**
 * Formata os dados dos alunos de uma turma
 * @param turma Turma com seus alunos
 * @returns Lista de alunos formatados
 */
export function formatarAlunosTurma(turma: TurmaWithAlunos): AlunoFormatado[] {
  if (!turma) {
    throw new Error("Dados da turma não fornecidos");
  }

  return turma.alunos.map(({ aluno }) => ({
    id: aluno.id,
    nome: aluno.user.name || "Sem nome",
    email: aluno.user.email || "Sem email",
    matricula: aluno.matricula,
    dataNascimento: aluno.dataNascimento,
  }));
} 