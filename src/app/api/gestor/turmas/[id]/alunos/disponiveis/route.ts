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

    // Busca os alunos disponíveis (que não estão em nenhuma turma ou estão na turma atual)
    const alunos = await prisma.aluno.findMany({
      where: {
        AND: [
          {
            user: {
              role: "ALUNO"
            }
          },
          {
            OR: [
              {
                turmas: {
                  none: {}
                }
              },
              {
                turmas: {
                  some: {
                    turmaId: params.id
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        turmas: {
          select: {
            turmaId: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    });

    // Formata os dados para retorno
    const alunosFormatados = alunos.map(aluno => ({
      id: aluno.id,
      nome: aluno.user.name,
      matricula: aluno.matricula,
      email: aluno.user.email,
      dataNascimento: aluno.dataNascimento,
      turmaId: aluno.turmas[0]?.turmaId || null
    }));

    return NextResponse.json(alunosFormatados);
  } catch (error) {
    console.error("Erro ao buscar alunos disponíveis:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 