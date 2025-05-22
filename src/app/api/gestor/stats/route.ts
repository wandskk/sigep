import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e sua escola
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        escolas: {
          include: {
            turmas: {
              include: {
                _count: {
                  select: {
                    alunos: true,
                  },
                },
              },
            },
            professores: true,
            disciplinas: true,
          },
        },
      },
    });

    if (!gestor || gestor.escolas.length === 0) {
      return new NextResponse("Gestor não encontrado ou sem escola", {
        status: 404,
      });
    }

    const escola = gestor.escolas[0];

    // Monta o objeto de estatísticas
    const stats = {
      totalAlunos: escola.turmas.reduce((acc, turma) => acc + turma._count.alunos, 0),
      totalProfessores: escola.professores.length,
      totalTurmas: escola.turmas.length,
      totalDisciplinas: escola.disciplinas.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 