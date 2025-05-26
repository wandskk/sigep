export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { School } from "@prisma/client";

async function gerarMatricula() {
  const anoAtual = new Date().getFullYear();
  
  // Buscar a última matrícula do ano atual
  const ultimoAluno = await prisma.aluno.findFirst({
    where: {
      matricula: {
        startsWith: anoAtual.toString(),
      },
    },
    orderBy: {
      matricula: 'desc',
    },
  });

  let numeroSequencial = 1;
  if (ultimoAluno) {
    // Extrair o número sequencial da última matrícula
    const ultimoNumero = parseInt(ultimoAluno.matricula.slice(-4));
    numeroSequencial = ultimoNumero + 1;
  }

  // Formatar a matrícula: ANO + 4 dígitos sequenciais (ex: 20240001)
  return `${anoAtual}${numeroSequencial.toString().padStart(4, '0')}`;
}

export async function GET(request: Request) {
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

    // Busca as turmas das escolas do gestor
    const escolasIds = gestor.escolas.map((escola: School) => escola.id);
    const turmas = await prisma.turma.findMany({
      where: {
        escolaId: {
          in: escolasIds,
        },
      },
      select: {
        id: true,
      },
    });

    const turmasIds = turmas.map(turma => turma.id);

    // Busca os alunos que estão nas turmas das escolas do gestor
    const alunos = await prisma.aluno.findMany({
      where: {
        turmas: {
          some: {
            turmaId: {
              in: turmasIds,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        turmas: {
          include: {
            turma: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                turno: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Formata os dados para enviar ao frontend
    const formattedAlunos = alunos.map(aluno => ({
      id: aluno.id,
      nome: aluno.user.name,
      matricula: aluno.matricula,
      email: aluno.user.email,
      dataNascimento: aluno.dataNascimento.toISOString(),
      turma: aluno.turmas[0]?.turma || null, // Pega a primeira turma do aluno
    }));

    return NextResponse.json(formattedAlunos);
  } catch (error) {
    console.error("[ALUNOS_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { nome, email, dataNascimento, turmaId, senha } = body;

    // Validação básica
    if (!nome || !email || !dataNascimento || !senha) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se o email já está em uso
    const emailExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    // Se uma turma foi especificada, verifica se ela pertence a uma das escolas do gestor
    if (turmaId) {
      const turma = await prisma.turma.findFirst({
        where: {
          id: turmaId,
          escolaId: {
            in: gestor.escolas.map((escola: School) => escola.id),
          },
        },
      });

      if (!turma) {
        return new NextResponse("Turma não encontrada ou não pertence à sua escola", {
          status: 400,
        });
      }
    }

    // Gera a matrícula
    const matricula = await gerarMatricula();

    // Cria o usuário e o aluno em uma transação
    const novoAluno = await prisma.$transaction(async (tx) => {
      // Cria o usuário
      const user = await tx.user.create({
        data: {
          name: nome,
          email,
          password: await bcrypt.hash(senha, 10),
          role: "ALUNO",
        },
      });

      // Cria o aluno
      const aluno = await tx.aluno.create({
        data: {
          userId: user.id,
          matricula,
          dataNascimento: new Date(dataNascimento),
          ...(turmaId && {
            turmas: {
              create: {
                turmaId,
              },
            },
          }),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          turmas: {
            include: {
              turma: {
                select: {
                  id: true,
                  nome: true,
                  codigo: true,
                  turno: true,
                },
              },
            },
          },
        },
      });

      return aluno;
    });

    // Formata os dados para enviar ao frontend
    const alunoFormatado = {
      id: novoAluno.id,
      nome: novoAluno.user.name,
      matricula: novoAluno.matricula,
      email: novoAluno.user.email,
      dataNascimento: novoAluno.dataNascimento.toISOString(),
      turma: novoAluno.turmas[0]?.turma || null,
    };

    return NextResponse.json(alunoFormatado);
  } catch (error) {
    console.error("[ALUNO_CREATE]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 