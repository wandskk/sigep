import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const data = await request.json();
    console.log("Dados recebidos:", data);

    const { nome, turno, escolaId } = data;

    if (!nome || !turno || !escolaId) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Gera um código único para a turma (pode ser adaptado conforme necessário)
    const codigo = `TURM${Math.floor(Math.random() * 10000)}`;

    const turma = await prisma.turma.create({
      data: {
        nome,
        turno,
        codigo,
        escolaId,
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

    console.log("Turma criada com sucesso:", turma);
    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 