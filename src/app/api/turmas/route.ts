import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Pega o ID da escola da query string
    const { searchParams } = new URL(request.url);
    const escolaId = searchParams.get("escolaId");

    if (!escolaId) {
      return new NextResponse("ID da escola não fornecido", { status: 400 });
    }

    // Verifica se o usuário tem permissão para acessar as turmas da escola
    if (session.user.role === UserRole.GESTOR) {
      const gestor = await prisma.gestor.findFirst({
        where: {
          userId: session.user.id,
          escolas: {
            some: {
              id: escolaId
            }
          }
        }
      });

      if (!gestor) {
        return new NextResponse("Não autorizado", { status: 401 });
      }
    }

    // Busca as turmas da escola
    const turmas = await prisma.turma.findMany({
      where: {
        escolaId
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        turno: true
      },
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json(turmas);
  } catch (error) {
    console.error("[TURMAS_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 