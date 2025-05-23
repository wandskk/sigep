import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Verificar se o responsável existe
    const responsavel = await prisma.responsavel.findUnique({
      where: { id },
    });

    if (!responsavel) {
      return new NextResponse("Responsável não encontrado", { status: 404 });
    }

    const { nome, cpf, email, telefone, parentesco, endereco } = data;

    // Atualizar responsável
    const responsavelAtualizado = await prisma.responsavel.update({
      where: { id },
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ""),
        email,
        telefone: telefone.replace(/\D/g, ""),
        parentesco,
        endereco
      },
    });

    return NextResponse.json(responsavelAtualizado);
  } catch (error) {
    console.error("[RESPONSAVEL_PUT]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o responsável existe
    const responsavel = await prisma.responsavel.findUnique({
      where: { id: params.id },
    });

    if (!responsavel) {
      return new NextResponse("Responsável não encontrado", { status: 404 });
    }

    // Excluir responsável
    await prisma.responsavel.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RESPONSAVEL_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
