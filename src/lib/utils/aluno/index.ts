import { Aluno, Turma, User } from "@prisma/client";
import { AlunoFormatado as TabelaAlunoFormatado } from "@/components/tables/TabelaAlunos";

export type AlunoFormatado = TabelaAlunoFormatado;

type AlunoWithRelations = Aluno & {
  turmas: {
    turma: Turma;
  }[];
  user: User;
};

export function formatarAlunos(alunos: (Aluno & { 
  user: { name: string; email: string | null };
  turmas: {
    turma: Turma & {
      escola?: {
        id: string;
        name: string;
      };
    };
  }[];
})[]): AlunoFormatado[] {
  return alunos.map((aluno) => ({
    id: aluno.id,
    nome: aluno.user.name,
    matricula: aluno.matricula,
    email: aluno.user.email || "Sem email",
    dataNascimento: aluno.dataNascimento,
    turma: aluno.turmas[0]?.turma ? {
      id: aluno.turmas[0].turma.id,
      nome: aluno.turmas[0].turma.nome,
      codigo: aluno.turmas[0].turma.codigo,
      turno: aluno.turmas[0].turma.turno as "MATUTINO" | "VESPERTINO" | "NOTURNO",
      escola: aluno.turmas[0].turma.escola,
    } : null,
  }));
}

export * from './aluno.utils'; 