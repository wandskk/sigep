export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);

    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.GESTOR)) {
      console.log("Usuário não autorizado:", session?.user?.role);
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    console.log("Dados recebidos:", body);
    const { nome, turno } = body;

    // Validação básica
    if (!nome || !turno) {
      console.log("Dados inválidos - nome ou turno faltando");
      return new NextResponse("Nome e turno são obrigatórios", { status: 400 });
    }

    // Verifica se a turma existe
    const turmaExistente = await prisma.turma.findUnique({
      where: { id: params.id },
    });

    if (!turmaExistente) {
      console.log("Turma não encontrada:", params.id);
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    console.log("Atualizando turma com dados:", { nome, turno });

    // Atualiza a turma (apenas nome e turno)
    const turmaAtualizada = await prisma.turma.update({
      where: { id: params.id },
      data: {
        nome,
        turno,
      },
      include: {
        escola: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log("Turma atualizada com sucesso:", turmaAtualizada);
    return NextResponse.json(turmaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.GESTOR)) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verifica se a turma existe
    const turmaExistente = await prisma.turma.findUnique({
      where: { id: params.id },
    });

    if (!turmaExistente) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Exclui a turma
    await prisma.turma.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "GESTOR"].includes(session.user.role)) {
      return new Response("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { nome, turno } = body;

    if (!nome || !turno) {
      return new Response("Nome e turno são obrigatórios", { status: 400 });
    }

    const turma = await prisma.turma.findUnique({
      where: { id: params.id },
    });

    if (!turma) {
      return new Response("Turma não encontrada", { status: 404 });
    }

    const turmaAtualizada = await prisma.turma.update({
      where: { id: params.id },
      data: { nome, turno },
    });

    return NextResponse.json(turmaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
} 