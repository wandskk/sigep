import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new Response("Não autorizado", { status: 401 });
    }

    const data = await request.json();
    const { nome, turno, escolaId } = data;

    if (!nome || !turno || !escolaId) {
      return new Response("Dados incompletos", { status: 400 });
    }

    // Gera um código único para a turma
    const codigo = `TURM${Math.floor(Math.random() * 10000)}`;

    const turma = await prisma.turma.create({
      data: {
        nome,
        turno,
        codigo,
        escolaId,
      },
    });

    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
} 