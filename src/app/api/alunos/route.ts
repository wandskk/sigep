import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { UserRole, Sexo, Situacao } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verifica se o usuário é um gestor
    if (session.user.role !== UserRole.GESTOR) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { nome, email, dataNascimento, turmaId, senha } = body;

    if (!nome || !email || !dataNascimento || !turmaId || !senha) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    // Busca a turma para verificar a escola
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
      select: { escolaId: true }
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Verifica se o gestor tem acesso à escola da turma
    const gestor = await prisma.gestor.findFirst({
      where: {
        userId: session.user.id,
        escolas: {
          some: {
            id: turma.escolaId
          }
        }
      }
    });

    if (!gestor) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Gera a matrícula do aluno
    const matricula = await generateMatricula(turma.escolaId);

    // Cria o usuário e o aluno em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria o usuário
      const hashedPassword = await bcrypt.hash(senha, 10);
      const user = await tx.user.create({
        data: {
          name: nome,
          email,
          password: hashedPassword,
          role: UserRole.ALUNO,
          firstLogin: true
        }
      });

      // Cria o aluno
      const aluno = await tx.aluno.create({
        data: {
          userId: user.id,
          matricula,
          dataNascimento: new Date(dataNascimento),
          sexo: Sexo.OUTRO, // Valor padrão, pode ser atualizado depois
          endereco: "", // Campos obrigatórios com valores padrão
          cidade: "",
          estado: "",
          cep: "",
          nomeMae: "",
          dataMatricula: new Date(),
          situacao: Situacao.ATIVO
        }
      });

      // Adiciona o aluno à turma
      await tx.alunoTurma.create({
        data: {
          alunoId: aluno.id,
          turmaId
        }
      });

      return { user, aluno };
    });

    return NextResponse.json({
      id: result.aluno.id,
      nome: result.user.name,
      email: result.user.email,
      matricula: result.aluno.matricula
    });
  } catch (error) {
    console.error("[ALUNOS_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

async function generateMatricula(escolaId: string): Promise<string> {
  // Busca o último aluno da escola
  const lastAluno = await prisma.aluno.findFirst({
    where: {
      turmas: {
        some: {
          turma: {
            escolaId
          }
        }
      }
    },
    orderBy: { matricula: "desc" }
  });

  // Se não houver alunos, começa com 1
  if (!lastAluno) {
    return "1";
  }

  // Incrementa a última matrícula
  const lastMatricula = parseInt(lastAluno.matricula);
  return (lastMatricula + 1).toString();
} 