import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateAlunoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  dataNascimento: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Data de nascimento inválida",
  }),
  turmaId: z.string().optional(),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "GESTOR") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    const alunoId = params.id;

    // Verifica se o aluno existe
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: { user: true },
    });

    if (!alunoExistente) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    const body = await request.json();
    const dadosValidados = updateAlunoSchema.parse(body);

    // Verifica se o email já está em uso por outro usuário
    if (dadosValidados.email !== alunoExistente.user.email) {
      const emailEmUso = await prisma.user.findUnique({
        where: { email: dadosValidados.email },
      });

      if (emailEmUso) {
        return new NextResponse(
          JSON.stringify({ error: "Email já está em uso" }),
          { status: 400 }
        );
      }
    }

    // Atualiza o aluno e o usuário em uma transação
    const alunoAtualizado = await prisma.$transaction(async (tx) => {
      // Atualiza o usuário
      const userAtualizado = await tx.user.update({
        where: { id: alunoExistente.userId },
        data: {
          name: dadosValidados.nome,
          email: dadosValidados.email,
          ...(dadosValidados.senha && {
            password: await bcrypt.hash(dadosValidados.senha, 10),
          }),
        },
      });

      // Atualiza o aluno
      const aluno = await tx.aluno.update({
        where: { id: alunoId },
        data: {
          dataNascimento: new Date(dadosValidados.dataNascimento),
          turmas: dadosValidados.turmaId
            ? {
                connect: { id: dadosValidados.turmaId },
              }
            : undefined,
        },
        include: {
          turmas: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return aluno;
    });

    return NextResponse.json(alunoAtualizado);
  } catch (error) {
    console.error("[ALUNO_UPDATE]", error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Dados inválidos", details: error.errors }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "GESTOR") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    const alunoId = params.id;

    // Verifica se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: { user: true },
    });

    if (!aluno) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    // Deleta o aluno e o usuário em uma transação
    await prisma.$transaction(async (tx) => {
      // Remove todas as relações do aluno com turmas
      await tx.alunoTurma.deleteMany({
        where: { alunoId },
      });

      // Deleta o aluno
      await tx.aluno.delete({
        where: { id: alunoId },
      });

      // Deleta o usuário
      await tx.user.delete({
        where: { id: aluno.userId },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ALUNO_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    );
  }
} 