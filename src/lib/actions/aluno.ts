import { prisma } from "@/lib/prisma";
import { Prisma, UserRole, Parentesco } from "@prisma/client";

/**
 * Tipo que representa um aluno com suas relações
 */
export type AlunoWithRelations = Prisma.AlunoGetPayload<{
  include: {
    user: true;
    turmas: {
      include: {
        turma: {
          include: {
            escola: true;
          };
        };
      };
    };
  };
}>;

export async function getAlunosByEscola(escolaId: string) {
  try {
    const alunos = await prisma.aluno.findMany({
      where: {
        turmas: {
          some: {
            turma: {
              escolaId: escolaId
            }
          }
        }
      },
      include: {
        turmas: {
          include: {
            turma: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alunos;
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    throw new Error('Não foi possível buscar os alunos da escola');
  }
}

export async function getAlunoById(id: string, escolaIds: string[]): Promise<AlunoWithRelations | null> {
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id,
        turmas: {
          some: {
            turma: {
              escolaId: {
                in: escolaIds
              }
            }
          }
        }
      },
      include: {
        user: true,
        turmas: {
          include: {
            turma: {
              include: {
                escola: true
              }
            }
          }
        }
      }
    });

    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    return aluno;
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    throw new Error('Não foi possível buscar os dados do aluno');
  }
}

export async function getResponsaveisByAlunoId(alunoId: string) {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        responsaveis: true
      }
    });

    if (!aluno) {
      throw new Error("Aluno não encontrado");
    }

    return aluno.responsaveis;
  } catch (error) {
    console.error("Erro ao buscar responsáveis:", error);
    throw error;
  }
}

export async function addResponsavel(id: string, nome: string, cpf: string, email: string, telefone: string, parentesco: Parentesco, endereco?: string) {
  try {
    const responsavel = await prisma.responsavel.create({
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ""),
        email,
        telefone: telefone.replace(/\D/g, ""),
        parentesco,
        endereco: endereco || "",
        alunoId: id
      },
    });

    return responsavel;
  } catch (error) {
    console.error("Erro ao adicionar responsável:", error);
    throw error;
  }
}

export async function getAllAlunos() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        turmas: {
          include: {
            turma: {
              include: {
                escola: true
              }
            }
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alunos;
  } catch (error) {
    console.error('Erro ao buscar todos os alunos:', error);
    throw new Error('Não foi possível buscar os alunos');
  }
} 