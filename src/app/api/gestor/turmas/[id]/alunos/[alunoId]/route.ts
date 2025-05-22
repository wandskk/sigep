import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { UserRole } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; alunoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o ID da escola do gestor
    const gestor = await (prisma as any).gestor.findUnique({
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
    const turma = await (prisma as any).turma.findUnique({
      where: {
        id: params.id,
        escolaId: gestor.escolaId,
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Verifica se o aluno existe e pertence à escola do gestor
    const aluno = await (prisma as any).aluno.findUnique({
      where: {
        id: params.alunoId,
        escolaId: gestor.escolaId,
        turmaId: params.id,
      },
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado na turma", { status: 404 });
    }

    // Remove o aluno da turma
    await (prisma as any).aluno.update({
      where: {
        id: params.alunoId,
      },
      data: {
        turmaId: null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao remover aluno da turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 