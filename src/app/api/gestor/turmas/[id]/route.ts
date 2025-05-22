import { NextResponse } from "next/server";import { getServerSession } from "next-auth";import { authOptions } from "@/lib/auth/auth-options";import { prisma } from "@/lib/prisma";
import { School, UserRole, Turno, Turma as PrismaTurma } from "@prisma/client";
import * as z from "zod";

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  turno: z.enum(["MATUTINO", "VESPERTINO", "NOTURNO"], {
    required_error: "Turno é obrigatório",
  }),
});

// Interfaces para tipagem das relações
interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: Turno;
  escolaId: string;
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  userId: string;
}

interface Professor {
  id: string;
  nome: string;
  userId: string;
}

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
}

interface TurmaWithRelations extends Turma {
  escola: School;
  alunos: Array<{
    aluno: Aluno & {
      user: {
        name: string;
      };
    };
  }>;
  professores: Array<{
    professor: Professor & {
      user: {
        name: string;
      };
    };
    disciplinas: Array<{
      disciplina: Disciplina;
    }>;
  }>;
  disciplinas: Array<{
    disciplina: Disciplina;
    professorId: string | null;
    professor?: {
      id: string;
      nome: string;
    } | null;
  }>;
  _count: {
    alunos: number;
    professores: number;
    disciplinas: number;
  };
}

interface TurmaFormatada {
  id: string;
  nome: string;
  _count: {
    alunos: number;
    professores: number;
  };
  disciplinas: Array<{
    id: string;
    nome: string;
    professor: {
      id: string;
      nome: string;
    } | null;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("API: Iniciando GET para turma", params.id);
    const session = await getServerSession(authOptions);
    console.log("API: Sessão do usuário:", session?.user?.role);

    if (!session || session.user.role !== "GESTOR") {
      console.log("API: Usuário não autorizado");
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
    console.log("API: Gestor encontrado:", !!gestor, "Escolas:", gestor?.escolas.length);

    if (!gestor || gestor.escolas.length === 0) {
      console.log("API: Gestor não encontrado ou sem escolas");
      return new NextResponse("Gestor não encontrado ou sem escola", {
        status: 404,
      });
    }

    const turmaId = params.id;
    
    // Busca a turma e verifica se pertence à escola do gestor
    console.log("API: Buscando turma com ID", turmaId);
    const turma = await prisma.turma.findFirst({
      where: {
        id: turmaId,
        escolaId: {
          in: gestor.escolas.map((escola) => escola.id),
        },
      },
      include: {
        _count: {
          select: {
            alunos: true,
            professores: true,
          },
        },
        disciplinas: {
          include: {
            disciplina: true,
          },
        },
      },
    });
    console.log("API: Turma encontrada:", !!turma);

    if (!turma) {
      console.log("API: Turma não encontrada");
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Busca as disciplinas com seus professores
    const disciplinas = await Promise.all(
      turma.disciplinas.map(async (td) => {
        // Busca o professor associado à disciplina na turma
        const professorDisciplina = await prisma.professorTurma.findFirst({
          where: {
            turmaId: turmaId,
            disciplinas: {
              some: {
                disciplinaId: td.disciplinaId
              }
            }
          },
          include: {
            professor: true
          }
        });

        return {
          id: td.disciplina.id,
          nome: td.disciplina.nome,
          professor: professorDisciplina ? {
            id: professorDisciplina.professor.id,
            nome: professorDisciplina.professor ? await getProfessorNome(professorDisciplina.professor.id) : "Professor sem nome"
          } : null
        };
      })
    );

    // Função auxiliar para obter o nome do professor
    async function getProfessorNome(professorId: string): Promise<string> {
      const professor = await prisma.user.findFirst({
        where: {
          professor: {
            id: professorId
          }
        }
      });
      return professor?.name || "Professor sem nome";
    }

    // Conta as disciplinas
    const disciplinasCount = await prisma.disciplinaTurma.count({
      where: {
        turmaId
      }
    });

    // Formata a resposta
    const turmaFormatada: TurmaFormatada = {
      id: turma.id,
      nome: turma.nome,
      _count: {
        alunos: turma._count.alunos,
        professores: turma._count.professores,
      },
      disciplinas,
    };
    console.log("API: Dados formatados para retorno:", JSON.stringify(turmaFormatada));

    return NextResponse.json(turmaFormatada);
  } catch (error) {
    console.error("[TURMA_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params; // Extrai o id dos parâmetros de forma segura

    if (!session || session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o ID da escola do gestor
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
        escolas: {
          some: {
            turmas: {
              some: {
                id
              }
            }
          }
        }
      },
      select: {
        id: true,
        escolas: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!gestor) {
      return new NextResponse("Gestor não autorizado a gerenciar esta turma", { status: 403 });
    }

    const body = await request.json();
    const validatedData = turmaSchema.parse(body);

    // Atualiza a turma mantendo o código existente
    const turma = await prisma.turma.update({
      where: {
        id
      },
      data: {
        nome: validatedData.nome,
        turno: validatedData.turno
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        turno: true,
        escola: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(turma);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    console.error("Erro ao atualizar turma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verifica se a turma pertence a uma das escolas do gestor
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        escolaId: {
          in: gestor.escolas.map((escola: School) => escola.id),
        },
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Verifica se a turma tem alunos, professores ou disciplinas
    const turmaComRelacoes = await prisma.turma.findUnique({
      where: {
        id: params.id,
      },
      include: {
        _count: {
          select: {
            alunos: true,
            professores: true,
            disciplinas: true,
          },
        },
      },
    });

    if (!turmaComRelacoes) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    if (
      turmaComRelacoes._count.alunos > 0 ||
      turmaComRelacoes._count.professores > 0 ||
      turmaComRelacoes._count.disciplinas > 0
    ) {
      return new NextResponse(
        "Não é possível excluir uma turma que possui alunos, professores ou disciplinas associados",
        { status: 400 }
      );
    }

    // Exclui a turma
    await prisma.turma.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TURMA_DELETE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 