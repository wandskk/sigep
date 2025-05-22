import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { UserRole } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    // Busca os detalhes da turma com os alunos
    const turma = await (prisma as any).turma.findUnique({
      where: {
        id: params.id,
        escolaId: gestor.escolaId,
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        periodo: true,
        turno: true,
        alunos: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            email: true,
            dataNascimento: true,
          },
          orderBy: {
            nome: "asc",
          },
        },
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { alunoIds } = body;

    if (!Array.isArray(alunoIds) || alunoIds.length === 0) {
      return new NextResponse("Lista de alunos inválida", { status: 400 });
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

    // Verifica se os alunos existem e pertencem à escola do gestor
    const alunos = await (prisma as any).aluno.findMany({
      where: {
        id: {
          in: alunoIds,
        },
        escolaId: gestor.escolaId,
      },
      select: {
        id: true,
        turmaId: true,
      },
    });

    if (alunos.length !== alunoIds.length) {
      return new NextResponse("Um ou mais alunos não foram encontrados", {
        status: 404,
      });
    }

    // Verifica se algum aluno já está em outra turma
    const alunosEmOutraTurma = alunos.filter(
      (aluno: any) => aluno.turmaId && aluno.turmaId !== params.id
    );

    if (alunosEmOutraTurma.length > 0) {
      return new NextResponse(
        "Um ou mais alunos já estão matriculados em outra turma",
        { status: 400 }
      );
    }

    // Adiciona os alunos à turma
    await (prisma as any).aluno.updateMany({
      where: {
        id: {
          in: alunoIds,
        },
      },
      data: {
        turmaId: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao adicionar alunos à turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 