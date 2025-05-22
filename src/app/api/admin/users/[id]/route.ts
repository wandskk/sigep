import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { hash } from "bcryptjs";
import { z } from "zod";

// Schema de validação para atualização
const updateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "SECRETARIA", "GESTOR", "PROFESSOR", "ALUNO"]),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const json = await req.json();
    const body = updateUserSchema.parse(json);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    // Verificar se o email já está em uso por outro usuário
    if (body.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailInUse) {
        return new NextResponse("Email já está em uso", { status: 400 });
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
    };

    // Atualizar senha apenas se fornecida
    if (body.password) {
      updateData.password = await hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PUT]", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    // Não permitir que o usuário exclua a si mesmo
    if (existingUser.id === session.user.id) {
      return new NextResponse("Não é possível excluir seu próprio usuário", { status: 400 });
    }

    // Excluir o usuário
    await prisma.user.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 