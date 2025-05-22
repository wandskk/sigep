import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

// Cria uma instância do PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Define o tipo para a variável global do Prisma
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Usa uma instância global em desenvolvimento para evitar múltiplas instâncias
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Cria e exporta o adaptador Prisma para NextAuth
export function getPrismaAdapter() {
  return PrismaAdapter(prisma);
}
