import { Sexo, Situacao, Prisma } from "@prisma/client";

/**
 * Tipo para representar um Aluno com informações básicas
 */
export interface AlunoBasico {
  id: string;
  matricula: string;
  nome: string; // Vem do User.name
  email: string; // Vem do User.email
}

/**
 * Tipo para representar um Aluno com todos os detalhes
 */
export interface AlunoCompleto extends AlunoBasico {
  dataNascimento: Date;
  sexo: Sexo;
  cpf: string | null;
  nis: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string | null;
  nomeMae: string;
  nomePai: string | null;
  dataMatricula: Date;
  situacao: Situacao;
  responsavelId: string | null;
  turmas?: AlunoTurmaInfo[];
}

/**
 * Tipo para representar a associação entre Aluno e Turma
 */
export interface AlunoTurmaInfo {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
}

/**
 * Parâmetros para criar um novo aluno
 */
export interface CreateAlunoParams {
  userId: string;
  matricula: string;
  dataNascimento: Date;
  sexo: Sexo;
  cpf?: string;
  nis?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string;
  email?: string;
  nomeMae: string;
  nomePai?: string;
  dataMatricula: Date;
  situacao?: Situacao;
  responsavelId?: string;
}

/**
 * Parâmetros para atualizar um aluno
 */
export interface UpdateAlunoParams {
  matricula?: string;
  dataNascimento?: Date;
  sexo?: Sexo;
  cpf?: string | null;
  nis?: string | null;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string | null;
  email?: string | null;
  nomeMae?: string;
  nomePai?: string | null;
  dataMatricula?: Date;
  situacao?: Situacao;
  responsavelId?: string | null;
}

/**
 * Tipo para representar as contagens relacionadas a um aluno
 */
export interface AlunoCount {
  turmas: number;
  presencas: number;
  notas: number;
}

/**
 * Tipo para representar o resultado da busca de alunos
 */
export interface FindAlunosResult {
  alunos: AlunoBasico[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Tipo para representar filtros na busca de alunos
 */
export interface AlunoFilters {
  matricula?: string;
  nome?: string;
  turmaId?: string;
  situacao?: Situacao;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo Prisma para Aluno com relações
 */
export type AlunoWithRelations = Prisma.AlunoGetPayload<{
  include: {
    user: true;
    responsavel: true;
    turmas: {
      include: {
        turma: true;
      }
    }
  }
}>; 