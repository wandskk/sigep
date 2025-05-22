import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const disciplinaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Busca a disciplina específica
    const disciplina = await prisma.disciplina.findFirst({
      where: {
        id: params.id,
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

    if (!disciplina) {
      return new NextResponse("Disciplina não encontrada", { status: 404 });
    }

    return NextResponse.json(disciplina);
  } catch (error) {
    console.error("[DISCIPLINA_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verifica se a disciplina existe e pertence à escola do gestor
    const disciplinaExistente = await prisma.disciplina.findFirst({
      where: {
        id: params.id,
        escolaId,
      },
    });

    if (!disciplinaExistente) {
      return new NextResponse("Disciplina não encontrada", { status: 404 });
    }

    const body = await req.json();
    const validatedData = disciplinaSchema.parse(body);

    // Atualiza a disciplina
    const disciplina = await prisma.disciplina.update({
      where: {
        id: params.id,
      },
      data: validatedData,
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

    console.error("[DISCIPLINA_PUT]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verifica se a disciplina existe e pertence à escola do gestor
    const disciplina = await prisma.disciplina.findFirst({
      where: {
        id: params.id,
        escolaId,
      },
      include: {
        _count: {
          select: {
            turmas: true,
            professores: true,
          },
        },
      },
    });

    if (!disciplina) {
      return new NextResponse("Disciplina não encontrada", { status: 404 });
    }

    // Verifica se a disciplina está em uso
    if (disciplina._count.turmas > 0 || disciplina._count.professores > 0) {
      return new NextResponse(
        "Não é possível excluir uma disciplina que está em uso por turmas ou professores",
        { status: 400 }
      );
    }

    // Exclui a disciplina
    await prisma.disciplina.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DISCIPLINA_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 