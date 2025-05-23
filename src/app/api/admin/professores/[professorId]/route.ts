import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfessorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  escolaId: z.string().min(1, "Escola é obrigatória"),
});

export async function PUT(
  request: Request,
  { params }: { params: { professorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const body = await request.json();
    const data = updateProfessorSchema.parse(body);

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id: params.professorId },
      include: {
        professor: true,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    if (professor.role !== "PROFESSOR") {
      return new NextResponse("Usuário não é um professor", { status: 400 });
    }

    // Verifica se o email já está em uso por outro usuário
    if (data.email !== professor.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return new NextResponse("Email já está em uso", { status: 400 });
      }
    }

    // Verifica se a escola existe
    const escola = await prisma.school.findUnique({
      where: { id: data.escolaId },
    });

    if (!escola) {
      return new NextResponse("Escola não encontrada", { status: 404 });
    }

    // Atualiza o usuário e o perfil do professor em uma transação
    const updatedProfessor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: params.professorId },
        data: {
          name: data.nome,
          email: data.email,
          professor: {
            update: {
              escola: {
                connect: {
                  id: data.escolaId,
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          professor: {
            select: {
              escola: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return user;
    });

    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error("[PROFESSORES_PUT]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 });
    }
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { professorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id: params.professorId },
      include: {
        professor: true,
      },
    });

    if (!professor) {
      return new NextResponse("Professor não encontrado", { status: 404 });
    }

    if (professor.role !== "PROFESSOR") {
      return new NextResponse("Usuário não é um professor", { status: 400 });
    }

    // Exclui o usuário e o perfil do professor em uma transação
    await prisma.$transaction(async (tx) => {
      // Primeiro exclui o perfil do professor
      if (professor.professor) {
        await tx.professor.delete({
          where: { id: professor.professor.id },
        });
      }

      // Depois exclui o usuário
      await tx.user.delete({
        where: { id: params.professorId },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROFESSORES_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 