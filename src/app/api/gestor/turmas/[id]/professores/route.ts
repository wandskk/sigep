import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const professorSchema = z.object({
  professorId: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    // Busca a turma e seus professores
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        escolaId: gestor.escolaId,
      },
      include: {
        professores: {
          include: {
            disciplinas: true,
          },
        },
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    return NextResponse.json(turma);
  } catch (error) {
    console.error("[TURMA_PROFESSORES_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { professorId } = professorSchema.parse(body);

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

    // Verifica se o professor existe e pertence à escola do gestor
    const professor = await prisma.professor.findFirst({
      where: {
        id: professorId,
        escolaId: gestor.escolaId,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    // Verifica se o professor já está na turma
    const professorNaTurma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        professores: {
          some: {
            id: professorId,
          },
        },
      },
    });

    if (professorNaTurma) {
      return new NextResponse("Professor já está atribuído a esta turma", {
        status: 400,
      });
    }

    // Adiciona o professor à turma
    await prisma.turma.update({
      where: {
        id: params.id,
      },
      data: {
        professores: {
          connect: {
            id: professorId,
          },
        },
      },
    });

    return new NextResponse("Professor adicionado com sucesso", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    console.error("[TURMA_PROFESSORES_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 