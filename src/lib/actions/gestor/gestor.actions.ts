import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Tipo que representa um gestor com suas relações
 */
export type GestorWithRelations = Prisma.GestorGetPayload<{
  include: {
    escolas: true;
  };
}>;

/**
 * Busca um gestor pelo ID do usuário com suas escolas
 * @param userId ID do usuário do gestor
 * @returns Gestor com suas escolas ou null se não encontrado
 */
export async function getGestorByUserId(userId: string): Promise<GestorWithRelations | null> {
  return prisma.gestor.findFirst({
    where: { userId },
    include: { escolas: true },
  });
} 