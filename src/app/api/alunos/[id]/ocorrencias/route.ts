export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// Listar ocorrências
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (
      session.user.role !== UserRole.GESTOR &&
      session.user.role !== UserRole.PROFESSOR &&
      session.user.role !== UserRole.ADMIN
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const { id } = await params;

    // Buscar o aluno para verificar a escola
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turmas: {
          include: {
            turma: {
              select: {
                escolaId: true,
              },
            },
          },
        },
        ocorrencias: {
          include: {
            autor: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            dataOcorrencia: "desc"
          }
        }
      },
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    // Verificar se o usuário tem acesso à escola do aluno
    if (session.user.role === UserRole.PROFESSOR) {
      const professor = await prisma.professor.findFirst({
        where: {
          userId: session.user.id,
          turmas: {
            some: {
              turma: {
                escolaId: aluno.turmas[0]?.turma.escolaId,
              },
            },
          },
        },
      });

      if (!professor) {
        return new NextResponse("Acesso negado", { status: 403 });
      }
    }

    return NextResponse.json(aluno.ocorrencias);
  } catch (error) {
    console.error("[OCORRENCIAS_GET]", error);
    return new NextResponse("Erro ao buscar ocorrências", { status: 500 });
  }
}

// Criar ocorrência
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (
      session.user.role !== UserRole.GESTOR &&
      session.user.role !== UserRole.PROFESSOR &&
      session.user.role !== UserRole.ADMIN
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    // Ajuste para garantir formato ISO-8601
    if (data.dataOcorrencia && typeof data.dataOcorrencia === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(data.dataOcorrencia)) {
        data.dataOcorrencia = data.dataOcorrencia + "T00:00:00.000Z";
      }
    }

    // Verificar se o aluno existe e obter a escola
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turmas: {
          include: {
            turma: {
              select: {
                escolaId: true,
              },
            },
          },
        },
      },
    });

    if (!aluno || !aluno.turmas[0]?.turma.escolaId) {
      return new NextResponse("Aluno não encontrado ou sem turma", {
        status: 404,
      });
    }

    // Verificar se o usuário tem acesso à escola do aluno
    if (session.user.role === UserRole.PROFESSOR) {
      const professor = await prisma.professor.findFirst({
        where: {
          userId: session.user.id,
          turmas: {
            some: {
              turma: {
                escolaId: aluno.turmas[0].turma.escolaId,
              },
            },
          },
        },
      });

      if (!professor) {
        return new NextResponse("Acesso negado", { status: 403 });
      }
    }

    // Criar ocorrência
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        ...data,
        alunoId: id,
        autorId: session.user.id,
        escolaId: aluno.turmas[0].turma.escolaId,
      },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(ocorrencia);
  } catch (error) {
    console.error("[OCORRENCIAS_POST]", error);
    return new NextResponse("Erro ao criar ocorrência", { status: 500 });
  }
}
