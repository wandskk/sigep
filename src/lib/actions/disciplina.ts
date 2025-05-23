"use server";

import { prisma } from "@/lib/prisma";

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  escolaId: string;
}

export async function getDisciplinasByEscola(escolaId: string): Promise<Disciplina[]> {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      where: {
        escolaId,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return disciplinas;
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    throw new Error("Não foi possível buscar as disciplinas");
  }
} 