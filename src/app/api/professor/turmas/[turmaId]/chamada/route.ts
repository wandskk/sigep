import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Schema de validação para os dados da chamada
const chamadaSchema = z.object({
  data: z.string().transform(str => new Date(str)),
  presencas: z.array(z.object({
    alunoId: z.string(),
    presente: z.boolean()
  }))
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

    if (!data) {
      return NextResponse.json({ error: "Data não fornecida" }, { status: 400 });
    }

    const dataChamada = new Date(data);

    // Busca a turma com os alunos e suas presenças na data específica
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.turmaId,
        professores: {
          some: {
            professor: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        escola: true,
        alunos: {
          include: {
            aluno: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            presencas: {
              where: {
                data: {
                  gte: new Date(dataChamada.setHours(0, 0, 0, 0)),
                  lt: new Date(dataChamada.setHours(23, 59, 59, 999))
                }
              },
              select: {
                presente: true
              }
            }
          }
        }
      }
    }) as TurmaWithAlunos | null;

    if (!turma) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    // Formata os dados para a resposta
    const alunosFormatados = turma.alunos.map(at => ({
      id: at.aluno.id,
      nome: at.aluno.user.name,
      matricula: at.aluno.matricula,
      presente: at.presencas[0]?.presente ?? false
    }));

    return NextResponse.json({
      turma: {
        id: turma.id,
        nome: turma.nome,
        codigo: turma.codigo,
        escola: {
          id: turma.escola.id,
          nome: turma.escola.name
        }
      },
      alunos: alunosFormatados
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

    const body = await request.json();
    const { data, presencas } = chamadaSchema.parse(body);

    // Verifica se a turma existe e se o professor tem acesso
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.turmaId,
        professores: {
          some: {
            professor: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        alunos: {
          select: {
            id: true,
            alunoId: true
          }
        }
      }
    }) as TurmaWithAlunosIds | null;

    if (!turma) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    // Cria ou atualiza as presenças em uma transação
    await prisma.$transaction(
      async (tx) => {
        for (const presenca of presencas) {
          const alunoTurma = turma.alunos.find(at => at.alunoId === presenca.alunoId);
          if (!alunoTurma) continue;

          await tx.presenca.upsert({
            where: {
              alunoTurmaId_data: {
                alunoTurmaId: alunoTurma.id,
                data: data
              }
            },
            update: {
              presente: presenca.presente
            },
            create: {
              alunoTurmaId: alunoTurma.id,
              data: data,
              presente: presenca.presente
            }
          });
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
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