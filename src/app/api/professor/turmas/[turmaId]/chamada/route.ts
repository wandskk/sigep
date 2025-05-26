export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Schema de validação para os dados da chamada
const chamadaSchema = z.object({
  data: z.string().transform((str) => new Date(str)),
  disciplinaId: z.string(),
  presencas: z.array(
    z.object({
      alunoId: z.string(),
      presente: z.boolean(),
    })
  ),
});

type TurmaWithAlunos = Prisma.TurmaGetPayload<{
  include: {
    escola: true;
    alunos: {
      include: {
        aluno: {
          include: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
        presencas: {
          where: {
            disciplinaId: string;
            data: {
              gte: Date;
              lt: Date;
            };
          };
          select: {
            presente: true;
          };
        };
      };
    };
  };
}>;

export async function GET(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const disciplinaId = searchParams.get("disciplinaId");
    const { turmaId } = await params;

    if (!data || !disciplinaId) {
      return NextResponse.json(
        { error: "Data e disciplina são obrigatórios" },
        { status: 400 }
      );
    }

    const dataChamada = new Date(data);

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

    // Verifica se o professor tem acesso à disciplina na turma
    const professorDisciplina = await prisma.professorDisciplinaTurma.findFirst(
      {
        where: {
          professorTurma: {
            professorId: professor.id,
            turmaId: turmaId,
          },
          disciplinaId: disciplinaId,
        },
      }
    );

    if (!professorDisciplina) {
      return NextResponse.json(
        { error: "Disciplina não encontrada ou acesso negado" },
        { status: 404 }
      );
    }

    // Busca a turma com os alunos e suas presenças na data específica
    const turma = (await prisma.turma.findFirst({
      where: {
        id: turmaId,
        professores: {
          some: {
            professorId: professor.id,
          },
        },
      },
      include: {
        escola: true,
        alunos: {
          include: {
            aluno: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            presencas: {
              where: {
                data: {
                  gte: new Date(dataChamada.setHours(0, 0, 0, 0)),
                  lt: new Date(dataChamada.setHours(23, 59, 59, 999)),
                },
                disciplinaId: disciplinaId,
              },
              select: {
                presente: true,
              },
            },
          },
        },
      },
    })) as TurmaWithAlunos | null;

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // Formata os dados para a resposta
    const alunosFormatados = turma.alunos.map((at) => ({
      id: at.aluno.id,
      nome: at.aluno.user.name,
      matricula: at.aluno.matricula,
      presente: at.presencas[0]?.presente ?? true,
    }));

    return NextResponse.json({
      turma: {
        id: turma.id,
        nome: turma.nome,
        codigo: turma.codigo,
        escola: {
          id: turma.escola.id,
          nome: turma.escola.name,
        },
      },
      disciplina: {
        id: disciplinaId,
      },
      alunos: alunosFormatados,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da chamada:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da chamada" },
      { status: 500 }
    );
  }
}

type TurmaWithAlunosIds = Prisma.TurmaGetPayload<{
  include: {
    alunos: {
      select: {
        id: true;
        alunoId: true;
      };
    };
  };
}>;

export async function POST(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { turmaId } = params;
    const body = await request.json();
    const { data, disciplinaId, presencas } = chamadaSchema.parse(body);

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

    // Verifica se o professor tem acesso à disciplina na turma
    const professorDisciplina = await prisma.professorDisciplinaTurma.findFirst(
      {
        where: {
          professorTurma: {
            professorId: professor.id,
            turmaId,
          },
          disciplinaId: disciplinaId,
        },
      }
    );

    if (!professorDisciplina) {
      return NextResponse.json(
        { error: "Disciplina não encontrada ou acesso negado" },
        { status: 404 }
      );
    }

    // Verifica se a turma existe e se o professor tem acesso
    const turma = (await prisma.turma.findFirst({
      where: {
        id: turmaId,
        professores: {
          some: {
            professorId: professor.id,
          },
        },
      },
      include: {
        alunos: {
          select: {
            id: true,
            alunoId: true,
          },
        },
      },
    })) as TurmaWithAlunosIds | null;

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se já existe uma chamada para esta disciplina na mesma data
    const chamadaExistente = await prisma.presenca.findFirst({
      where: {
        alunoTurma: {
          turmaId,
        },
        disciplinaId: disciplinaId,
        data: data,
      },
      select: {
        id: true,
        alunoTurmaId: true,
        presente: true,
      },
    });

    // Se existir chamada, atualiza as presenças
    if (chamadaExistente) {
      await prisma.$transaction(
        async (tx) => {
          for (const presenca of presencas) {
            const alunoTurma = turma.alunos.find(
              (at: { alunoId: string }) => at.alunoId === presenca.alunoId
            );
            if (!alunoTurma) continue;

            await tx.presenca.updateMany({
              where: {
                alunoTurmaId: alunoTurma.id,
                disciplinaId: disciplinaId,
                data: data,
              },
              data: {
                presente: presenca.presente,
              },
            });
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      return NextResponse.json({ message: "Chamada atualizada com sucesso" });
    }

    // Se não existir chamada, cria uma nova
    await prisma.$transaction(
      async (tx) => {
        for (const presenca of presencas) {
          const alunoTurma = turma.alunos.find(
            (at: { alunoId: string }) => at.alunoId === presenca.alunoId
          );
          if (!alunoTurma) continue;

          await tx.presenca.create({
            data: {
              alunoTurmaId: alunoTurma.id,
              disciplinaId: disciplinaId,
              data: data,
              presente: presenca.presente,
            },
          });
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return NextResponse.json({ message: "Chamada registrada com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao salvar chamada" },
      { status: 500 }
    );
  }
}
