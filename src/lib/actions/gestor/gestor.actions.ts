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
  const gestor = await prisma.gestor.findFirst({
    where: { userId },
    include: { 
      escolas: true
    },
  });

  return gestor;
}

/**
 * Verifica se o gestor tem escolas associadas
 * @param gestorId ID do gestor
 * @returns true se o gestor tem escolas, false caso contrário
 */
export async function gestorHasEscolas(gestorId: string): Promise<boolean> {
  const escolas = await prisma.school.findMany({
    where: { 
      gestorId
    },
    select: { 
      id: true,
      name: true,
      gestorId: true
    }
  });

  return escolas.length > 0;
} 