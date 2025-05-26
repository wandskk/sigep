export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { School } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    // Busca o professor
    const professor = await prisma.professor.findFirst({
      where: {
        id: params.id,
        user: {
          id: {
            in: await prisma.user.findMany({
              where: {
                professor: {
                  id: {
                    in: await prisma.professorTurma.findMany({
                      where: {
                        turma: {
                          escolaId: {
                            in: gestor.escolas.map((escola: School) => escola.id),
                          },
                        },
                      },
                      select: {
                        professorId: true,
                      },
                    }).then(data => data.map(item => item.professorId)),
                  },
                },
              },
              select: {
                id: true,
              },
            }).then(data => data.map(item => item.id)),
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    // Formata o resultado
    return NextResponse.json({
      id: professor.id,
      nome: professor.user.name,
      email: professor.user.email,
    });
  } catch (error) {
    console.error("[PROFESSOR_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { nome, email } = await request.json();

    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
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

    // Verifica se o professor existe
    const professor = await prisma.professor.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    // Atualiza o usuário do professor (nome e email)
    const usuarioAtualizado = await prisma.user.update({
      where: {
        id: professor.userId,
      },
      data: {
        name: nome,
        ...(email ? { email } : {}),
      },
    });

    // Retorna os dados atualizados
    return NextResponse.json({
      id: professor.id,
      nome: usuarioAtualizado.name,
      email: usuarioAtualizado.email,
    });
  } catch (error) {
    console.error("[PROFESSOR_PUT]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    // Verifica se o professor existe
    const professor = await prisma.professor.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    // Verifica se o professor tem turmas associadas
    const professorTurmas = await prisma.professorTurma.findMany({
      where: {
        professorId: params.id,
      },
    });

    if (professorTurmas.length > 0) {
      return new NextResponse(
        "Não é possível excluir um professor que está vinculado a turmas",
        { status: 400 }
      );
    }

    // Exclui o professor
    await prisma.professor.delete({
      where: {
        id: params.id,
      },
    });

    // Opcionalmente, também exclui o usuário associado
    await prisma.user.delete({
      where: {
        id: professor.userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROFESSOR_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 