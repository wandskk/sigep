import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Bimestre, TipoNota } from "@prisma/client";

// Esquema de validação para as notas
const notasSchema = z.object({
  disciplinaId: z.string(),
  data: z.string(),
  tipo: z.enum(["PROVA", "TRABALHO", "EXERCICIO"]),
  bimestre: z.enum(["PRIMEIRO", "SEGUNDO", "TERCEIRO", "QUARTO"]),
  notas: z.array(
    z.object({
      alunoId: z.string(),
      valor: z.number().min(0).max(10),
    })
  ),
});

export async function GET(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o professor tem acesso à turma
    const professorTurma = await prisma.professorTurma.findFirst({
      where: {
        turmaId: params.turmaId,
        professor: {
          userId: session.user.id,
        },
      },
    });

    if (!professorTurma) {
      return NextResponse.json(
        { error: "Turma não encontrada ou acesso negado" },
        { status: 404 }
      );
    }

    // Busca a turma com suas disciplinas
    const turma = await prisma.turma.findUnique({
      where: {
        id: params.turmaId,
      },
      include: {
        escola: true,
        disciplinas: {
          include: {
            disciplina: true,
          },
        },
      },
    });

    if (!turma) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    // Busca os alunos da turma
    const alunosTurma = await prisma.alunoTurma.findMany({
      where: {
        turmaId: params.turmaId,
      },
      include: {
        aluno: {
          include: {
            user: true,
          },
        },
      },
    });

    // Busca as notas dos alunos
    const notas = await prisma.nota.findMany({
      where: {
        alunoTurmaId: {
          in: alunosTurma.map(at => at.id),
        },
      },
      include: {
        disciplina: true,
      },
    });

    // Formata os dados para a resposta
    const formattedTurma = {
      id: turma.id,
      nome: turma.nome,
      codigo: turma.codigo,
      turno: turma.turno,
      escola: {
        id: turma.escola.id,
        nome: turma.escola.name,
      },
      disciplinas: turma.disciplinas.map((dt) => ({
        id: dt.disciplina.id,
        nome: dt.disciplina.nome,
        codigo: dt.disciplina.codigo,
      })),
      alunos: alunosTurma.map((at) => {
        // Filtra as notas deste aluno
        const alunoNotas = notas.filter(n => n.alunoTurmaId === at.id);
        
        return {
          id: at.aluno.id,
          nome: at.aluno.user.name,
          matricula: at.aluno.matricula,
          notas: alunoNotas.map((n) => ({
            id: n.id,
            valor: n.valor,
            tipo: n.tipo,
            bimestre: n.bimestre,
            data: n.data.toISOString().split("T")[0],
            disciplinaId: n.disciplinaId,
          })),
        };
      }),
    };

    return NextResponse.json(formattedTurma);
  } catch (error) {
    console.error("[NOTAS_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o professor tem acesso à turma
    const professorTurma = await prisma.professorTurma.findFirst({
      where: {
        turmaId: params.turmaId,
        professor: {
          userId: session.user.id,
        },
      },
    });

    if (!professorTurma) {
      return NextResponse.json(
        { error: "Turma não encontrada ou acesso negado" },
        { status: 404 }
      );
    }

    // Valida os dados enviados
    const body = await request.json();
    const { disciplinaId, data, tipo, bimestre, notas } = notasSchema.parse(body);

    // Obtém os IDs de AlunoTurma para os alunos
    const alunosTurma = await prisma.alunoTurma.findMany({
      where: {
        turmaId: params.turmaId,
        aluno: {
          id: {
            in: notas.map((n) => n.alunoId),
          },
        },
      },
      select: {
        id: true,
        alunoId: true,
      },
    });

    // Cria um mapa de alunoId para alunoTurmaId para facilitar o acesso
    const alunoIdToAlunoTurmaId = alunosTurma.reduce((map, at) => {
      map[at.alunoId] = at.id;
      return map;
    }, {} as Record<string, string>);

    // Salva ou atualiza as notas em uma transação
    await prisma.$transaction(async (tx) => {
      for (const nota of notas) {
        const alunoTurmaId = alunoIdToAlunoTurmaId[nota.alunoId];
        if (!alunoTurmaId) continue;

        // Busca uma nota existente com os mesmos critérios
        const notaExistente = await tx.nota.findFirst({
          where: {
            alunoTurmaId,
            disciplinaId,
            tipo: tipo as TipoNota,
            bimestre: bimestre as Bimestre,
            data: new Date(data),
          },
        });

        if (notaExistente) {
          // Atualiza a nota existente
          await tx.nota.update({
            where: {
              id: notaExistente.id,
            },
            data: {
              valor: nota.valor,
            },
          });
        } else {
          // Cria uma nova nota
          await tx.nota.create({
            data: {
              alunoTurmaId,
              disciplinaId,
              tipo: tipo as TipoNota,
              bimestre: bimestre as Bimestre,
              data: new Date(data),
              valor: nota.valor,
            },
          });
        }
      }
    });

    return NextResponse.json({ message: "Notas registradas com sucesso" });
  } catch (error) {
    console.error("[NOTAS_POST]", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 