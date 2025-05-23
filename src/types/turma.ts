import { Turno } from "@prisma/client";

export interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: Turno;
  escola: {
    id: string;
    name: string;
  };
  totalAlunos: number;
  disciplinas: Array<{
    id: string;
    nome: string;
    codigo: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  escolaId: string;
} 