import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; professorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o ID da escola do gestor
    const gestor = await prisma.gestor.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        escolaId: true,
      },
    });

    if (!gestor) {
      return new NextResponse("Gestor não encontrado", { status: 404 });
    }

    // Verifica se a turma existe e pertence à escola do gestor
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        escolaId: gestor.escolaId,
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Verifica se o professor existe e está na turma
    const professorNaTurma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        professores: {
          some: {
            id: params.professorId,
          },
        },
      },
    });

    if (!professorNaTurma) {
      return new NextResponse("Professor não encontrado na turma", {
        status: 404,
      });
    }

    // Remove o professor da turma
    await prisma.turma.update({
      where: {
        id: params.id,
      },
      data: {
        professores: {
          disconnect: {
            id: params.professorId,
          },
        },
      },
    });

    return new NextResponse("Professor removido com sucesso", { status: 200 });
  } catch (error) {
    console.error("[TURMA_PROFESSOR_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 