export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PROFESSOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { turmaId } = await params;

    // Busca a turma e verifica se o professor tem acesso
    const professorTurma = await prisma.professorTurma.findFirst({
      where: {
        professor: {
          userId: session.user.id,
        },
        turmaId: turmaId,
      },
      include: {
        turma: {
          include: {
            escola: true,
            alunos: true,
            disciplinas: {
              include: {
                disciplina: true,
              },
            },
          },
        },
      },
    });

    if (!professorTurma) {
      return new NextResponse("Turma não encontrada ou acesso negado", {
        status: 404,
      });
    }

    // Formata os dados para retorno
    const turma = {
      id: professorTurma.turma.id,
      nome: professorTurma.turma.nome,
      codigo: professorTurma.turma.codigo,
      turno: professorTurma.turma.turno,
      escola: {
        id: professorTurma.turma.escola.id,
        nome: professorTurma.turma.escola.name,
      },
      totalAlunos: professorTurma.turma.alunos.length,
      disciplinas: professorTurma.turma.disciplinas.map((dt) => ({
        id: dt.disciplina.id,
        nome: dt.disciplina.nome,
        codigo: dt.disciplina.codigo,
      })),
    };

    return NextResponse.json(turma);
  } catch (error) {
    console.error("[TURMA_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
