import { prisma } from "@/lib/prisma";

export interface Professor {
  id: string;
  nome: string;
  email?: string;
  senhaTemporaria?: string;
  escola?: {
    id: string;
    nome: string;
  } | null;
}

export async function getProfessoresByEscola(escolaId: string): Promise<Professor[]> {
  try {
    const professores = await prisma.professor.findMany({
      where: {
        escolaId,
      },
      include: {
        user: true,
        escola: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return professores.map(professor => ({
      id: professor.id,
      nome: professor.user.name,
      email: professor.user.email,
      escola: professor.escola ? {
        id: professor.escola.id,
        nome: professor.escola.name,
      } : null,
    }));
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    throw new Error("Erro ao buscar professores");
  }
} 