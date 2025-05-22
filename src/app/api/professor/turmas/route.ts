import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PROFESSOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const turmas = await prisma.professorTurma.findMany({
      where: {
        professor: {
          userId: session.user.id,
        },
      },
      include: {
        turma: {
          include: {
            escola: true,
            disciplinas: {
              include: {
                disciplina: true,
              },
            },
            _count: {
              select: {
                alunos: true,
                disciplinas: true,
              },
            },
          },
        },
      },
      orderBy: {
        turma: {
          nome: "asc",
        },
      },
    });

    const turmasFormatadas = turmas.map((pt) => ({
      id: pt.turma.id,
      nome: pt.turma.nome,
      codigo: pt.turma.codigo,
      turno: pt.turma.turno,
      escola: {
        id: pt.turma.escola.id,
        nome: pt.turma.escola.name,
      },
      totalAlunos: pt.turma._count.alunos,
      disciplinas: pt.turma.disciplinas.map((dt) => ({
        id: dt.disciplina.id,
        nome: dt.disciplina.nome,
        codigo: dt.disciplina.codigo,
      })),
    }));

    return NextResponse.json(turmasFormatadas);
  } catch (error) {
    console.error("[TURMAS_GET] Error", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 