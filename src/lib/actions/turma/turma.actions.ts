import { prisma } from "@/lib/prisma";
import { TurmaWithRelations } from "@/lib/utils/turma/turma.formatters";
import { Prisma } from "@prisma/client";

/**
 * Busca uma turma pelo ID com todas as suas relações
 * @param id ID da turma
 * @returns Turma com todas as relações ou null se não encontrada
 */
export async function getTurmaById(id: string): Promise<TurmaWithRelations | null> {
  return prisma.turma.findUnique({
    where: { id },
    include: {
      escola: true,
      disciplinas: {
        include: {
          disciplina: true,
          turma: {
            include: {
              professores: {
                include: {
                  professor: {
                    include: {
                      user: true,
                    },
                  },
                  disciplinas: {
                    include: {
                      disciplina: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          alunos: true,
          professores: true,
        },
      },
    },
  });
}

/**
 * Busca todos os professores de uma escola
 * @param escolaId ID da escola
 * @returns Lista de professores com seus dados básicos
 */
export async function getProfessoresByEscola(escolaId: string) {
  return prisma.professor.findMany({
    where: { escolaId },
    include: {
      user: { select: { name: true } },
    },
  });
}

/**
 * Busca todas as disciplinas de uma escola
 * @param escolaId ID da escola
 * @returns Lista de disciplinas com seus dados básicos
 */
export async function getDisciplinasByEscola(escolaId: string) {
  return prisma.disciplina.findMany({
    where: { escolaId },
    select: {
      id: true,
      nome: true,
      codigo: true,
    },
  });
}

/**
 * Busca todos os dados necessários para a página de turma
 * @param turmaId ID da turma
 * @param escolaId ID da escola
 * @returns Objeto contendo turma, professores e disciplinas
 */
export async function getTurmaPageData(turmaId: string, escolaId: string) {
  const [turma, professores, disciplinas] = await Promise.all([
    getTurmaById(turmaId),
    getProfessoresByEscola(escolaId),
    getDisciplinasByEscola(escolaId),
  ]);

  if (!turma) {
    throw new Error("Turma não encontrada");
  }

  return {
    turma,
    professores,
    disciplinas,
  };
}

/**
 * Tipo que representa uma turma com seus alunos
 */
export type TurmaWithAlunos = Prisma.TurmaGetPayload<{
  include: {
    alunos: {
      include: {
        aluno: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;

/**
 * Busca uma turma com seus alunos
 * @param turmaId ID da turma
 * @param escolaIds Array de IDs das escolas do gestor
 * @returns Turma com seus alunos ou null se não encontrada
 */
export async function getTurmaWithAlunos(turmaId: string, escolaIds: string[]): Promise<TurmaWithAlunos | null> {
  return prisma.turma.findFirst({
    where: {
      id: turmaId,
      escolaId: {
        in: escolaIds,
      },
    },
    include: {
      alunos: {
        include: {
          aluno: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
} 