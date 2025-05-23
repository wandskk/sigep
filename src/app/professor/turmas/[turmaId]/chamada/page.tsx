import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ChamadaForm from "./ChamadaForm";
import { Turno } from "@prisma/client";

interface PageProps {
  params: {
    turmaId: string;
  };
}

interface AlunoTurma {
  aluno: {
    id: string;
    matricula: string;
    user: {
      name: string;
    };
  };
}

interface TurmaFormatada {
  id: string;
  nome: string;
  codigo?: string;
  turno?: Turno;
  escola: {
    id: string;
    name: string;
  };
  alunos: {
    id: string;
    nome: string;
    matricula: string;
    presente: boolean;
  }[];
}

export default async function ChamadaPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Busca o professor pelo ID do usuário
  const professor = await prisma.professor.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!professor) {
    redirect("/professor/nao-encontrado");
  }

  const { turmaId } = await params;

  // Busca a turma e verifica se o professor tem acesso
  const turma = await prisma.turma.findUnique({
    where: {
      id: turmaId,
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
          }
        }
      }
    },
  });

  if (!turma) {
    redirect("/professor/turmas");
  }

  // Verifica se o professor tem acesso à turma
  const professorTurma = await prisma.professorTurma.findFirst({
    where: {
      professorId: professor.id,
      turmaId: turma.id,
    },
  });

  if (!professorTurma) {
    redirect("/professor/turmas");
  }

  // Busca as disciplinas que o professor leciona nesta turma
  const disciplinas = await prisma.disciplina.findMany({
    where: {
      professores: {
        some: {
          AND: [
            { professorTurma: { professorId: professor.id } },
            { professorTurma: { turmaId: turma.id } }
          ]
        },
      },
    },
    select: {
      id: true,
      nome: true,
      codigo: true,
    },
  });

  // Formata os dados da turma para o componente
  const turmaFormatada: TurmaFormatada = {
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    turno: turma.turno,
    escola: {
      id: turma.escola.id,
      name: turma.escola.name,
    },
    alunos: turma.alunos.map((at) => ({
      id: at.aluno.id,
      nome: at.aluno.user.name,
      matricula: at.aluno.matricula,
      presente: true,
    })),
  };

  return (
    <ChamadaForm
      turma={turmaFormatada}
      disciplinas={disciplinas}
      turmaId={turma.id}
    />
  );
}
