import { Prisma } from "@prisma/client";
import { ProfessorInfo } from "../turma/turma.types";

/**
 * Tipo para representar uma Disciplina com informações básicas
 */
export interface DisciplinaBasica {
  id: string;
  nome: string;
  codigo: string;
}

/**
 * Tipo para representar uma Disciplina com todos os detalhes
 */
export interface DisciplinaCompleta extends DisciplinaBasica {
  escolaId: string;
  escolaNome?: string;
  turmas?: DisciplinaTurmaSimples[];
  professores?: ProfessorDisciplinaSimples[];
}

/**
 * Tipo para representar a associação entre Disciplina e Turma simplificada
 */
export interface DisciplinaTurmaSimples {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
}

/**
 * Tipo para representar a associação entre Professor e Disciplina simplificada
 */
export interface ProfessorDisciplinaSimples {
  id: string;
  nome: string;
}

/**
 * Tipo para representar uma disciplina em uma turma
 */
export interface DisciplinaTurmaInfo {
  id: string;
  nome: string;
  professor: ProfessorInfo | null;
}

/**
 * Parâmetros para criar uma nova disciplina
 */
export interface CreateDisciplinaParams {
  nome: string;
  codigo: string;
  escolaId: string;
}

/**
 * Parâmetros para atualizar uma disciplina
 */
export interface UpdateDisciplinaParams {
  nome?: string;
  codigo?: string;
  escolaId?: string;
}

/**
 * Tipo para representar filtros na busca de disciplinas
 */
export interface DisciplinaFilters {
  nome?: string;
  codigo?: string;
  escolaId?: string;
  turmaId?: string;
  professorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo para representar o resultado da busca de disciplinas
 */
export interface FindDisciplinasResult {
  disciplinas: DisciplinaBasica[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Tipo para associar professores a disciplinas em uma turma
 */
export interface AssociarProfessorDisciplinaParams {
  professorId: string;
  disciplinaId: string;
  turmaId: string;
}

/**
 * Tipo Prisma para Disciplina com relações
 */
export type DisciplinaWithRelations = Prisma.DisciplinaGetPayload<{
  include: {
    escola: true;
    turmas: {
      include: {
        turma: true;
      }
    };
    professores: {
      include: {
        professorTurma: {
          include: {
            professor: {
              include: {
                user: true;
              }
            };
          }
        }
      }
    }
  }
}>; 