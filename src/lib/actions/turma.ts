import { prisma } from "@/lib/prisma";

export interface Turma {
  id: string;
  nome: string;
  turno: string;
  _count: {
    alunos: number;
    professores: number;
    disciplinas: number;
  };
}

export async function getTurmasByEscola(escolaId: string): Promise<Turma[]> {
  try {
    const turmas = await prisma.turma.findMany({
      where: {
        escolaId,
      },
      include: {
        _count: {
          select: {
            alunos: true,
            professores: true,
            disciplinas: true,
          },
        },
      },
    });

    return turmas;
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    throw new Error("Erro ao buscar turmas");
  }
} 