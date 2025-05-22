import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { School } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; disciplinaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e suas escolas
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        escolas: true,
      },
    });

    if (!gestor || gestor.escolas.length === 0) {
      return new NextResponse("Gestor não encontrado ou sem escola", {
        status: 404,
      });
    }

    // Busca a turma e verifica se pertence à escola do gestor
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        escolaId: {
          in: gestor.escolas.map((escola: School) => escola.id),
        },
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Remover primeiro as relações professor-disciplina-turma associadas
    await prisma.professorDisciplinaTurma.deleteMany({
      where: {
        disciplinaId: params.disciplinaId,
        professorTurma: {
          turmaId: params.id
        }
      },
    });

    // Remove a disciplina da turma
    await prisma.disciplinaTurma.deleteMany({
      where: {
        turmaId: params.id,
        disciplinaId: params.disciplinaId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TURMA_DISCIPLINA_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 