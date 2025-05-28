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
      totalTurmas
    ] = await Promise.all([
      prisma.escola.count(),
      prisma.user.count({ where: { role: "GESTOR" } }),
      prisma.user.count({ where: { role: "PROFESSOR" } }),
      prisma.aluno.count(),
      prisma.turma.count()
    ]);

    return {
      totalEscolas,
      totalGestores,
      totalProfessores,
      totalAlunos,
      totalTurmas
    };
  } catch (error) {
    console.error("[Dashboard] Erro detalhado ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas do dashboard");
  }
} 