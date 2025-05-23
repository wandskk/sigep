import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

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
    if (session.user.role !== UserRole.GESTOR && session.user.role !== UserRole.PROFESSOR) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Buscar o aluno com suas relações
    const aluno = await prisma.aluno.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        turmas: {
          include: {
            turma: {
              include: {
                escola: true
              }
            }
          }
        },
        responsaveis: true
      }
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    // Verificar se o usuário tem acesso ao aluno
    if (session.user.role === UserRole.PROFESSOR) {
      const professor = await prisma.professor.findFirst({
        where: {
          userId: session.user.id,
          turmas: {
            some: {
              turma: {
                alunos: {
                  some: {
                    alunoId: aluno.id
                  }
                }
              }
            }
          }
        }
      });

      if (!professor) {
        return new NextResponse("Acesso negado", { status: 403 });
      }
    }

    return NextResponse.json(aluno);
  } catch (error) {
    console.error("[ALUNO_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 