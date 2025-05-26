import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole, Parentesco } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.GESTOR && session.user.role !== UserRole.ADMIN)) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id } = await params;
    const responsaveis = await prisma.responsavel.findMany({
      where: {
        alunoId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responsaveis);
  } catch (error) {
    console.error("[RESPONSAVEIS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verifica se o usuário é um gestor ou admin
    if (session.user.role !== UserRole.GESTOR && session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const alunoId = params.id;
    const body = await request.json();
    const { nome, cpf, email, telefone, parentesco, endereco } = body;

    if (!nome || !cpf || !email || !telefone || !parentesco || !endereco) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: {
        id: alunoId,
      },
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    // Se for gestor, verifica se tem acesso ao aluno
    if (session.user.role === UserRole.GESTOR) {
      const gestor = await prisma.gestor.findFirst({
        where: {
          userId: session.user.id,
          escolas: {
            some: {
              turmas: {
                some: {
                  alunos: {
                    some: {
                      alunoId: alunoId
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!gestor) {
        return new NextResponse("Acesso negado", { status: 403 });
      }
    }

    // Verifica se o CPF já está em uso
    const existingResponsavel = await prisma.responsavel.findUnique({
      where: { cpf: cpf.replace(/\D/g, "") },
    });

    if (existingResponsavel) {
      return new NextResponse("CPF já cadastrado", { status: 400 });
    }

    // Criar responsável
    const responsavel = await prisma.responsavel.create({
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ""),
        email,
        telefone,
        parentesco: parentesco as Parentesco,
        alunoId,
        endereco,
      },
    });

    return NextResponse.json(responsavel);
  } catch (error) {
    console.error("[RESPONSAVEIS_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
