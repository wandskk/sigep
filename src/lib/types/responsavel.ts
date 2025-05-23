import { Parentesco } from "@prisma/client";

export interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  parentesco: Parentesco;
  endereco: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponsavelCardProps {
  responsavel: Responsavel | null;
  className?: string;
} 