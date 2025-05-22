import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e sua escola
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        escolas: {
          include: {
            _count: {
              select: {
                turmas: true,
                professores: true,
                disciplinas: true,
              },
            },
          },
        },
      },
    });

    if (!gestor || gestor.escolas.length === 0) {
      return new NextResponse("Gestor não encontrado ou sem escola", {
        status: 404,
      });
    }

    // Retorna a primeira escola do gestor (assumindo que um gestor pode ter apenas uma escola)
    const escola = gestor.escolas[0];

    return NextResponse.json(escola);
  } catch (error) {
    console.error("[ESCOLA_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 