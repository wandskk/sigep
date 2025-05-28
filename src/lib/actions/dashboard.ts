import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    console.log("[Dashboard] Iniciando busca de estatísticas...");
    
    // Verificar conexão com o banco
    await prisma.$connect();
    console.log("[Dashboard] Conexão com o banco estabelecida");

    const [
      totalEscolas,
      totalGestores,
      totalProfessores,
      totalAlunos,
      totalTurmas
    ] = await Promise.all([
      prisma.school.count().catch((error: Error) => {
        console.error("[Dashboard] Erro ao contar escolas:", error);
        throw new Error("Erro ao contar escolas");
      }),
      prisma.user.count({ 
        where: { role: "GESTOR" } 
      }).catch((error: Error) => {
        console.error("[Dashboard] Erro ao contar gestores:", error);
        throw new Error("Erro ao contar gestores");
      }),
      prisma.user.count({ 
        where: { role: "PROFESSOR" } 
      }).catch((error: Error) => {
        console.error("[Dashboard] Erro ao contar professores:", error);
        throw new Error("Erro ao contar professores");
      }),
      prisma.aluno.count().catch((error: Error) => {
        console.error("[Dashboard] Erro ao contar alunos:", error);
        throw new Error("Erro ao contar alunos");
      }),
      prisma.turma.count().catch((error: Error) => {
        console.error("[Dashboard] Erro ao contar turmas:", error);
        throw new Error("Erro ao contar turmas");
      })
    ]);

    console.log("[Dashboard] Estatísticas obtidas com sucesso:", {
      totalEscolas,
      totalGestores,
      totalProfessores,
      totalAlunos,
      totalTurmas
    });

    return {
      totalEscolas: Number(totalEscolas),
      totalGestores: Number(totalGestores),
      totalProfessores: Number(totalProfessores),
      totalAlunos: Number(totalAlunos),
      totalTurmas: Number(totalTurmas)
    };
  } catch (error) {
    console.error("[Dashboard] Erro detalhado ao buscar estatísticas:", error);
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar estatísticas do dashboard: ${error.message}`);
    }
    throw new Error("Erro ao buscar estatísticas do dashboard");
  } finally {
    await prisma.$disconnect();
  }
} 