import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { School } from "@prisma/client";

const disciplinaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e suas escolas
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        escolas: true,
      },
    });

    if (!gestor || gestor.escolas.length === 0) {
      return new NextResponse("Gestor não encontrado ou sem escola", {
        status: 404,
      });
    }

    // Busca as disciplinas da escola do gestor
    const disciplinas = await prisma.disciplina.findMany({
      where: {
        escolaId: {
          in: gestor.escolas.map((escola: School) => escola.id),
        },
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(disciplinas);
  } catch (error) {
    console.error("[DISCIPLINAS_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e sua escola
    const gestor = await prisma.gestor.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        escolas: true,
      },
    });

    if (!gestor) {
      return new NextResponse("Gestor não encontrado", { status: 404 });
    }

    if (gestor.escolas.length === 0) {
      return new NextResponse("Gestor não possui escola associada", { status: 400 });
    }

    // Usa a primeira escola do gestor
    const escolaId = gestor.escolas[0].id;

    const body = await req.json();
    const validatedData = disciplinaSchema.parse(body);

    // Gera um código único para a disciplina
    const codigo = `DISC${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Cria a nova disciplina
    const disciplina = await prisma.disciplina.create({
      data: {
        ...validatedData,
        codigo,
        escolaId,
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        _count: {
          select: {
            turmas: true,
            professores: true,
          },
        },
      },
    });

    return NextResponse.json(disciplina);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 });
    }

    console.error("[DISCIPLINAS_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 