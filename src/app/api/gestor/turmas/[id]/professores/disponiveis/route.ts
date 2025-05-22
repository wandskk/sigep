import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Busca os professores da escola que não estão na turma
    const professores = await prisma.professor.findMany({
      where: {
        escolaId: gestor.escolaId,
        turmas: {
          none: {
            id: params.id,
          },
        },
      },
      include: {
        disciplinas: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(professores);
  } catch (error) {
    console.error("[TURMA_PROFESSORES_DISPONIVEIS_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 