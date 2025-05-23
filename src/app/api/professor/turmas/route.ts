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

    // Primeiro, busca o professor
    const professor = await prisma.professor.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    // Busca as turmas do professor com suas disciplinas
    const professorTurmas = await prisma.professorTurma.findMany({
      where: {
        professorId: professor.id,
      },
      include: {
        turma: {
          include: {
            escola: true,
            _count: {
              select: {
                alunos: true,
              },
            },
          },
        },
        disciplinas: {
          include: {
            disciplina: true,
          },
        },
      },
      orderBy: {
        turma: {
          nome: "asc",
        },
      },
    });

    const turmasFormatadas = professorTurmas.map((pt) => ({
      id: pt.turma.id,
      nome: pt.turma.nome,
      codigo: pt.turma.codigo,
      turno: pt.turma.turno,
      escola: {
        id: pt.turma.escola.id,
        nome: pt.turma.escola.name,
      },
      totalAlunos: pt.turma._count.alunos,
      disciplinas: pt.disciplinas.map((pdt) => ({
        id: pdt.disciplina.id,
        nome: pdt.disciplina.nome,
        codigo: pdt.disciplina.codigo,
      })),
    }));

    return NextResponse.json(turmasFormatadas);
  } catch (error) {
    console.error("[TURMAS_GET] Error", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 