import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";
import { generateTemporaryPassword } from "@/lib/utils";

const professorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  escolaId: z.string().min(1, "Escola é obrigatória"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const body = await request.json();
    const data = professorSchema.parse(body);

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    // Verifica se a escola existe
    const escola = await prisma.school.findUnique({
      where: { id: data.escolaId },
    });

    if (!escola) {
      return new NextResponse("Escola não encontrada", { status: 404 });
    }

    // Gera uma senha temporária
    const senhaTemporaria = generateTemporaryPassword();
    const hashedPassword = await hash(senhaTemporaria, 12);

    // Cria o usuário e o perfil do professor em uma transação
    const professor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.nome,
          email: data.email,
          password: hashedPassword,
          role: "PROFESSOR",
          firstLogin: true,
          professor: {
            create: {
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

      return {
        ...user,
        senhaTemporaria,
      };
    });

    return NextResponse.json(professor);
  } catch (error) {
    console.error("[PROFESSORES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 });
    }
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const professores = await prisma.user.findMany({
      where: {
        role: "PROFESSOR",
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(professores);
  } catch (error) {
    console.error("[PROFESSORES_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 