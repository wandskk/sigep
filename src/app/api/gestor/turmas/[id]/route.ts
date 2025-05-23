import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Turma, DisciplinaTurma, Disciplina as PrismaDisciplina, Professor as PrismaProfessor } from "@prisma/client";

interface ProfessorFormatado {
  id: string;
  nome: string;
}

interface DisciplinaFormatada {
  id: string;
  nome: string;
  professor: ProfessorFormatado | null;
}

interface TurmaFormatada {
  id: string;
  nome: string;
  _count: {
    alunos: number;
    professores: number;
  };
  disciplinas: DisciplinaFormatada[];
}

type ProfessorWithNome = PrismaProfessor & {
  nome: string;
};

type TurmaWithRelations = Turma & {
  disciplinas: (DisciplinaTurma & {
    disciplina: PrismaDisciplina & {
      professores: ProfessorWithNome[];
    };
  })[];
  _count: {
    alunos: number;
    professores: number;
  };
};

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session || session.user.role !== "GESTOR") {
      return new Response("Não autorizado", { status: 401 });
    }

    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        disciplinas: {
          include: {
            disciplina: {
              include: {
                professores: true,
              },
            },
          },
        },
        _count: {
          select: {
            alunos: true,
            professores: true,
          },
        },
      },
    }) as TurmaWithRelations | null;

    if (!turma) {
      return new Response("Turma não encontrada", { status: 404 });
    }

    // Formata os dados para retorno
    const turmaFormatada: TurmaFormatada = {
      id: turma.id,
      nome: turma.nome,
      _count: turma._count,
      disciplinas: turma.disciplinas.map((dt) => ({
        id: dt.disciplina.id,
        nome: dt.disciplina.nome,
        professor: dt.disciplina.professores[0] ? {
          id: dt.disciplina.professores[0].id,
          nome: dt.disciplina.professores[0].nome,
        } : null,
      })),
    };

    return NextResponse.json(turmaFormatada);
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session || session.user.role !== "GESTOR") {
      return new Response("Não autorizado", { status: 401 });
    }

    const data = await request.json();
    const { nome } = data;

    if (!nome) {
      return new Response("Nome é obrigatório", { status: 400 });
    }

    const turma = await prisma.turma.update({
      where: { id },
      data: { nome },
    });

    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    if (!session || session.user.role !== "GESTOR") {
      return new Response("Não autorizado", { status: 401 });
    }

    await prisma.turma.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
