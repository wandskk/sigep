import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoOcorrencia } from "@prisma/client";

const ocorrenciaSchema = z.object({
  tipo: z.nativeEnum(TipoOcorrencia),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dataOcorrencia: z.string().transform((str) => new Date(str)),
});

export async function POST(
  request: Request,
  { params }: { params: { alunoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const alunoId = await params.alunoId;
    const body = await request.json();
    const data = ocorrenciaSchema.parse(body);

    // Busca o professor
    const professor = await prisma.professor.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o professor tem acesso ao aluno
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: alunoId,
        turmas: {
          some: {
            turma: {
              professores: {
                some: {
                  professorId: professor.id,
                },
              },
            },
          },
        },
      },
      include: {
        turmas: {
          include: {
            turma: {
              select: {
                escolaId: true
              }
            }
          }
        }
      }
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado ou acesso negado" },
        { status: 404 }
      );
    }

    // Pega o ID da escola da primeira turma do aluno
    const escolaId = aluno.turmas[0]?.turma.escolaId;
    if (!escolaId) {
      return NextResponse.json(
        { error: "Aluno não está matriculado em nenhuma turma" },
        { status: 400 }
      );
    }

    // Cria a ocorrência
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao,
        dataOcorrencia: data.dataOcorrencia,
        visivelParaResponsavel: true,
        escolaId,
        alunoId,
        autorId: session.user.id
      },
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

    return NextResponse.json(ocorrencia);
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar ocorrência" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { alunoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { alunoId } = params;

    // Busca o professor
    const professor = await prisma.professor.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o professor tem acesso ao aluno através de alguma turma
    const alunoTurma = await prisma.alunoTurma.findFirst({
      where: {
        alunoId,
        turma: {
          professores: {
            some: {
              professorId: professor.id,
            },
          },
        },
      },
    });

    if (!alunoTurma) {
      return NextResponse.json(
        { error: "Aluno não encontrado ou acesso negado" },
        { status: 404 }
      );
    }

    // Busca as ocorrências do aluno
    const ocorrencias = await prisma.ocorrencia.findMany({
      where: {
        alunoId,
      },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        dataOcorrencia: "desc",
      },
    });

    return NextResponse.json(ocorrencias);
  } catch (error) {
    console.error("Erro ao buscar ocorrências:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ocorrências" },
      { status: 500 }
    );
  }
} 