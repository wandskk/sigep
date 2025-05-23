import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  totalDisciplinas: number;
}

export async function getDashboardStats(escolaId: string): Promise<DashboardStats> {
  try {
    const [
      totalAlunos,
      totalProfessores,
      totalTurmas,
      totalDisciplinas,
    ] = await Promise.all([
      prisma.alunoTurma.count({
        where: {
          turma: {
            escolaId,
          },
        },
      }),
      prisma.professor.count({
        where: {
          escolaId,
        },
      }),
      prisma.turma.count({
        where: {
          escolaId,
        },
      }),
      prisma.disciplina.count({
        where: {
          escolaId,
        },
      }),
    ]);

    return {
      totalAlunos,
      totalProfessores,
      totalTurmas,
      totalDisciplinas,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    throw new Error("Erro ao buscar estatísticas do dashboard");
  }
} 