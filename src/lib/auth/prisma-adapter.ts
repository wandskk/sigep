import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

// Tipo para a instância global do Prisma
type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

// Função para criar uma instância única do PrismaClient
const createPrismaClient = () => new PrismaClient();

// Extensão do tipo globalThis para incluir prisma
declare global {
  interface GlobalThis {
    prisma?: PrismaClientSingleton;
  }
}

// Obtém a instância global ou cria uma nova
const globalForPrisma = globalThis as { prisma?: PrismaClientSingleton };

// Exporta a instância do Prisma (reutiliza em dev, cria nova em produção)
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Armazena a instância global apenas em desenvolvimento
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Exporta o adaptador Prisma para o NextAuth
export const getPrismaAdapter = () => PrismaAdapter(prisma);
