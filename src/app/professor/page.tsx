import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Users, GraduationCap, BookOpen, Clock, MessageSquare, AlertCircle, ThumbsUp, Search } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Turno, UserRole } from "@prisma/client";
import { TurnoFilter } from "@/components/professor/TurnoFilter";
import { TurmasList } from "@/components/professor/TurmasList";
import { Turma } from "@/types/turma";

interface DashboardStats {
  totalTurmas: number;
  totalAlunos: number;
  totalOcorrencias: number;
}

interface TurmaRecente {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escola: {
    id: string;
    name: string;
  };
  alunos: Array<{
    aluno: {
      id: string;
      user: {
        name: string;
      };
    };
  }>;
}

interface OcorrenciaRecente {
  id: string;
  titulo: string;
  descricao: string;
  dataOcorrencia: Date;
  aluno: {
    user: {
      name: string;
    };
  };
  autor: {
    name: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  turmasRecentes: TurmaRecente[];
  ocorrenciasRecentes: OcorrenciaRecente[];
}

async function getDashboardStats(professorId: string): Promise<DashboardData> {
  try {
    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
      include: {
        escola: true,
      },
    });

    if (!professor) {
      throw new Error("Professor não encontrado");
    }

    const [turmas, ocorrencias] = await Promise.all([
      prisma.professorTurma.findMany({
        where: {
          professorId,
        },
        include: {
          turma: {
            include: {
              escola: true,
              alunos: {
                include: {
                  aluno: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.ocorrencia.findMany({
        where: {
          escolaId: professor.escolaId || undefined,
        },
        include: {
          aluno: {
            include: {
              user: true,
            },
          },
          autor: true,
        },
        orderBy: {
          dataOcorrencia: "desc",
        },
        take: 5,
      }),
    ]);

    const stats: DashboardStats = {
      totalTurmas: turmas.length,
      totalAlunos: turmas.reduce((acc, pt) => acc + pt.turma.alunos.length, 0),
      totalOcorrencias: ocorrencias.length,
    };

    return { 
      stats, 
      turmasRecentes: turmas.map(pt => pt.turma), 
      ocorrenciasRecentes: ocorrencias 
    };
  } catch (error) {
    throw new Error("Erro ao buscar dados do dashboard");
  }
}

async function getTurmasRecentes(professorId: string, turno?: string): Promise<Turma[]> {
  const where = {
    professores: {
      some: {
        professorId: professorId
      }
    },
    ...(turno && turno !== "TODOS" && { turno: turno as Turno })
  };

  const turmas = await prisma.turma.findMany({
    where,
    select: {
      id: true,
      nome: true,
      codigo: true,
      turno: true,
      createdAt: true,
      updatedAt: true,
      escolaId: true,
      escola: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          alunos: true,
          disciplinas: true
        }
      },
      disciplinas: {
        select: {
          disciplina: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          }
        }
      }
    },
    orderBy: {
      nome: 'asc'
    }
  });

  return turmas.map(turma => ({
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    turno: turma.turno,
    escola: {
      id: turma.escola.id,
      name: turma.escola.name
    },
    totalAlunos: turma._count.alunos,
    disciplinas: turma.disciplinas.map(d => ({
      id: d.disciplina.id,
      nome: d.disciplina.nome,
      codigo: d.disciplina.codigo
    })),
    createdAt: turma.createdAt,
    updatedAt: turma.updatedAt,
    escolaId: turma.escolaId
  }));
}

export default async function ProfessorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.PROFESSOR) {
    redirect("/login");
  }

  let dashboardData: DashboardData | null = null;
  let error: string | null = null;

  try {
    const professor = await prisma.professor.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!professor) {
      redirect("/login");
    }

    dashboardData = await getDashboardStats(professor.id);
  } catch (err) {
    error = "Não foi possível carregar os dados do dashboard";
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error || "Não foi possível carregar os dados do dashboard"}
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const { stats, turmasRecentes, ocorrenciasRecentes } = dashboardData;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard do Professor
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo(a), {session.user.name}
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link href="/professor/turmas" className="block group cursor-pointer relative w-full text-left">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Total de Turmas
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalTurmas}
                  </div>
                  <p className="text-sm text-white/80">Turmas ativas</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/professor/alunos" className="block group cursor-pointer relative w-full text-left">
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Total de Alunos
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalAlunos}
                  </div>
                  <p className="text-sm text-white/80">Alunos matriculados</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/professor/ocorrencias" className="block group cursor-pointer relative w-full text-left">
              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Ocorrências
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalOcorrencias}
                  </div>
                  <p className="text-sm text-white/80">Total registrado</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Turmas */}
          <TurmasList turmas={turmasRecentes} />
        </div>
      </div>
    </div>
  );
} 