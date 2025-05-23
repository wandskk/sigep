import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { hash } from "bcryptjs";
import { z } from "zod";

// Schema de validação
const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SECRETARIA", "GESTOR", "PROFESSOR", "ALUNO"]),
  escolaId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const json = await req.json();
    const body = createUserSchema.parse(json);

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    // Se for professor, verificar se a escola existe
    if (body.role === "PROFESSOR") {
      if (!body.escolaId) {
        return new NextResponse("Escola é obrigatória para professores", { status: 400 });
      }

      const escola = await prisma.school.findUnique({
        where: { id: body.escolaId },
      });

      if (!escola) {
        return new NextResponse("Escola não encontrada", { status: 404 });
      }
    }

    // Criar o usuário com a senha criptografada
    const hashedPassword = await hash(body.password, 12);

    // Criar o usuário e o perfil específico em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o usuário
      const user = await tx.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: body.role,
        },
      });

      // Criar o perfil específico baseado no papel
      switch (body.role) {
        case "PROFESSOR":
          await tx.professor.create({
            data: {
              userId: user.id,
              escolaId: body.escolaId,
            },
          });
          break;
        case "GESTOR":
          await tx.gestor.create({
            data: {
              userId: user.id,
            },
          });
          break;
        case "SECRETARIA":
          await tx.secretaria.create({
            data: {
              userId: user.id,
            },
          });
          break;
      }

      return user;
    });

    return NextResponse.json({
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.error("[USERS_POST]", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    return new NextResponse("Erro interno", { status: 500 });
  }
} 