import { TurmaCompleta, ProfessorInfo, DisciplinaBasica } from "@/lib/types";
import { Prisma } from "@prisma/client";

/**
 * Tipo que representa uma turma com todas as suas relações do banco de dados
 */
export type TurmaWithRelations = Prisma.TurmaGetPayload<{
  include: {
    escola: true;
    disciplinas: {
      include: {
        disciplina: true;
        turma: {
          include: {
            professores: {
              include: {
                professor: {
                  include: {
                    user: true;
                  };
                };
                disciplinas: {
                  include: {
                    disciplina: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    _count: {
      select: {
        alunos: true;
        professores: true;
      };
    };
  };
}>;

/**
 * Formata os dados da turma para o formato esperado pelo componente
 * @param turma Dados da turma vindos do banco
 * @returns Turma formatada com todos os dados necessários
 */
export function formatarTurma(turma: TurmaWithRelations): TurmaCompleta {
  if (!turma) {
    throw new Error("Dados da turma não fornecidos");
  }

  return {
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    turno: turma.turno,
    escolaId: turma.escolaId,
    escolaNome: turma.escola.name,
    totalAlunos: turma._count.alunos,
    totalProfessores: turma._count.professores,
    disciplinas: turma.disciplinas.map((dt) => {
      const professorDisciplina = dt.turma.professores.find((pt) =>
        pt.disciplinas.some((pdt) => pdt.disciplina.id === dt.disciplina.id)
      );

      return {
        id: dt.disciplina.id,
        nome: dt.disciplina.nome,
        professor: professorDisciplina
          ? {
              id: professorDisciplina.professor.id,
              nome: professorDisciplina.professor.user.name || "Sem nome",
            }
          : null,
      };
    }),
    _count: turma._count,
  };
}

/**
 * Formata os dados dos professores para o formato esperado pelo componente
 * @param professores Dados dos professores vindos do banco
 * @returns Lista de professores formatada
 */
export function formatarProfessores(
  professores: Array<{
    id: string;
    user: { name: string | null };
  }>
): ProfessorInfo[] {
  return professores.map((p) => ({
    id: p.id,
    nome: p.user.name || "Sem nome",
  }));
}

/**
 * Formata os dados das disciplinas para o formato esperado pelo componente
 * @param disciplinas Dados das disciplinas vindos do banco
 * @returns Lista de disciplinas formatada
 */
export function formatarDisciplinas(
  disciplinas: Array<{
    id: string;
    nome: string;
    codigo: string;
  }>
): DisciplinaBasica[] {
  return disciplinas.map((d) => ({
    id: d.id,
    nome: d.nome,
    codigo: d.codigo,
  }));
} 