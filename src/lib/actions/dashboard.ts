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
    throw new Error("Erro ao buscar estatísticas do dashboard");
  }
}

export interface AdminDashboardStats {
  totalEscolas: number;
  totalGestores: number;
  totalProfessores: number;
  totalAlunos: number;
  totalTurmas: number;
}

interface EscolaCount {
  count: bigint;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const [
      totalEscolas,
      totalGestores,
      totalProfessores,
      totalAlunos,
      totalTurmas,
    ] = await Promise.all([
      prisma.$queryRaw<EscolaCount[]>`SELECT COUNT(*) as count FROM "schools"`,
      prisma.gestor.count(),
      prisma.professor.count(),
      prisma.aluno.count(),
      prisma.turma.count(),
    ]);

    return {
      totalEscolas: Number(totalEscolas[0].count),
      totalGestores,
      totalProfessores,
      totalAlunos,
      totalTurmas,
    };
  } catch (error) {
    throw new Error("Erro ao buscar estatísticas do dashboard do admin");
  }
} 