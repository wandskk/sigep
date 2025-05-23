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
    if (!session || session.user.role !== UserRole.GESTOR) {
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

    // Verifica se o usuário é um gestor
    if (session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const alunoId = params.id;
    const body = await request.json();
    const { nome, cpf, email, telefone, parentesco, endereco } = body;

    if (!nome || !cpf || !email || !telefone || !parentesco || !endereco) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se o aluno existe e se o gestor tem acesso
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: alunoId,
        turmas: {
          some: {
            turma: {
              escola: {
                gestor: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado ou sem permissão", {
        status: 404,
      });
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
