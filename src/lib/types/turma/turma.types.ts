import { Turno, Prisma } from "@prisma/client";

/**
 * Tipo para representar informações do professor
 */
export interface ProfessorInfo {
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
 * Tipo para representar uma Turma com informações básicas
 */
export interface TurmaBasica {
  id: string;
  nome: string;
  codigo: string;
  turno: Turno;
}

/**
 * Tipo para representar uma Turma com todos os detalhes
 */
export interface TurmaCompleta extends TurmaBasica {
  escolaId: string;
  escolaNome?: string;
  totalAlunos: number;
  totalProfessores: number;
  disciplinas: DisciplinaTurmaInfo[];
  _count: {
    alunos: number;
    professores: number;
  };
}

/**
 * Parâmetros para criar uma nova turma
 */
export interface CreateTurmaParams {
  nome: string;
  codigo: string;
  turno: Turno;
  escolaId: string;
}

/**
 * Parâmetros para atualizar uma turma
 */
export interface UpdateTurmaParams {
  nome?: string;
  codigo?: string;
  turno?: Turno;
  escolaId?: string;
}

/**
 * Tipo para representar filtros na busca de turmas
 */
export interface TurmaFilters {
  nome?: string;
  codigo?: string;
  turno?: Turno;
  escolaId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo para representar o resultado da busca de turmas
 */
export interface FindTurmasResult {
  turmas: TurmaBasica[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Tipo Prisma para Turma com relações
 */
export type TurmaWithRelations = Prisma.TurmaGetPayload<{
  include: {
    escola: true;
    alunos: {
      include: {
        aluno: {
          include: {
            user: true;
          }
        }
      }
    };
    professores: {
      include: {
        professor: {
          include: {
            user: true;
          }
        }
      }
    };
    disciplinas: {
      include: {
        disciplina: true;
      }
    };
    _count: {
      select: {
        alunos: true;
        professores: true;
      }
    }
  }
}>; 