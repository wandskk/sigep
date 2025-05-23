import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// Editar ocorrência
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (
      session.user.role !== UserRole.GESTOR &&
      session.user.role !== UserRole.PROFESSOR
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    // Verificar se a ocorrência existe e se o usuário tem permissão para editá-la
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id },
      include: { autor: true },
    });

    if (!ocorrencia) {
      return new NextResponse("Ocorrência não encontrada", { status: 404 });
    }

    // Apenas o autor ou um gestor pode editar a ocorrência
    if (
      ocorrencia.autor.id !== session.user.id &&
      session.user.role !== UserRole.GESTOR
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Atualizar ocorrência
    const ocorrenciaAtualizada = await prisma.ocorrencia.update({
      where: { id },
      data,
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(ocorrenciaAtualizada);
  } catch (error) {
    console.error("[OCORRENCIA_PUT]", error);
    return new NextResponse("Erro ao atualizar ocorrência", { status: 500 });
  }
}

// Excluir ocorrência
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (
      session.user.role !== UserRole.GESTOR &&
      session.user.role !== UserRole.PROFESSOR
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    const { id } = await params;

    // Verificar se a ocorrência existe e se o usuário tem permissão para excluí-la
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id },
      include: { autor: true },
    });

    if (!ocorrencia) {
      return new NextResponse("Ocorrência não encontrada", { status: 404 });
    }

    // Apenas o autor ou um gestor pode excluir a ocorrência
    if (
      ocorrencia.autor.id !== session.user.id &&
      session.user.role !== UserRole.GESTOR
    ) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Excluir ocorrência
    await prisma.ocorrencia.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[OCORRENCIA_DELETE]", error);
    return new NextResponse("Erro ao excluir ocorrência", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!ocorrencia) {
      return new Response("Ocorrência não encontrada", { status: 404 });
    }

    return Response.json(ocorrencia);
  } catch (error) {
    return new Response("Erro ao buscar ocorrência", { status: 500 });
  }
}
