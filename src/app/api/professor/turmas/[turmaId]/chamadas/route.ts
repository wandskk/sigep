import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AlunoInfo {
  id: string;
  nome: string;
  matricula: string;
  presente: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: { turmaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PROFESSOR") {
      return new Response("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    // Verifica se o professor tem acesso à turma
    const professorTurma = await prisma.professorTurma.findFirst({
      where: {
        professor: {
          userId: session.user.id,
        },
        turmaId: params.turmaId,
      },
      include: {
        turma: {
          include: {
            alunos: {
              include: {
                aluno: {
                  include: {
                    user: true,
                  }
                },
                presencas: {
                  where: {
                    ...(dataInicio && dataFim
                      ? {
                          data: {
                            gte: new Date(dataInicio),
                            lte: new Date(dataFim),
                          },
                        }
                      : {}),
                  },
                  orderBy: {
                    data: "desc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!professorTurma) {
      return new NextResponse("Turma não encontrada ou acesso negado", {
        status: 404,
      });
    }

    // Agrupa as presenças por data
    const chamadasPorData = professorTurma.turma.alunos.reduce((acc, at) => {
      at.presencas.forEach((presenca) => {
        const dataStr = presenca.data.toISOString().split("T")[0];
        if (!acc[dataStr]) {
          acc[dataStr] = {
            data: dataStr,
            totalAlunos: professorTurma.turma.alunos.length,
            presentes: 0,
            ausentes: 0,
            alunos: [],
          };
        }
        
        // Garantir que o nome do aluno seja incluído
        const alunoInfo: AlunoInfo = {
          id: at.alunoId,
          nome: at.aluno.user.name || "Nome não disponível",
          matricula: at.aluno.matricula,
          presente: presenca.presente,
        };
        
        // Verificar se o aluno já foi adicionado para esta data
        const alunoJaAdicionado = acc[dataStr].alunos.some(
          (a: AlunoInfo) => a.id === alunoInfo.id
        );
        
        if (!alunoJaAdicionado) {
          acc[dataStr].alunos.push(alunoInfo);
          
          if (presenca.presente) {
            acc[dataStr].presentes++;
          } else {
            acc[dataStr].ausentes++;
          }
        }
      });
      return acc;
    }, {} as Record<string, any>);

    // Converte o objeto em array e ordena por data
    const chamadas = Object.values(chamadasPorData).sort((a, b) =>
      b.data.localeCompare(a.data)
    );

    return NextResponse.json(chamadas);
  } catch (error) {
    console.error("Erro ao buscar chamadas:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 