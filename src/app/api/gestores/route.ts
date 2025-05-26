export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    // Verifica se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verifica especificamente o gestor mencionado
    const gestorEspecifico = await prisma.gestor.findFirst({
      where: {
        user: {
          email: "gestor@sigep.com"
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Busca todos os gestores com seus dados de usuário
    const gestores = await prisma.gestor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(gestores);
  } catch (error) {
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 