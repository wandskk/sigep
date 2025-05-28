import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { Sexo, Situacao } from "@prisma/client";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const alunos = await prisma.aluno.findMany({
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
              include: {
                escola: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(
      alunos.map((aluno) => ({
        id: aluno.id,
        nome: aluno.user.name,
        email: aluno.user.email,
        matricula: aluno.matricula,
        escola: aluno.turmas[0]?.turma.escola || null,
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Iniciando criação de aluno...");
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      console.log("Usuário não autorizado:", session?.user);
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Dados recebidos:", body);

    const {
      nome,
      email,
      matricula,
      cpf,
      dataNascimento,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      turmaId,
    } = body;

    // Validar dados obrigatórios
    if (!nome || !email || !matricula || !cpf || !dataNascimento || !turmaId) {
      console.log("Dados obrigatórios faltando:", {
        nome: !!nome,
        email: !!email,
        matricula: !!matricula,
        cpf: !!cpf,
        dataNascimento: !!dataNascimento,
        turmaId: !!turmaId,
      });
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Verificar se já existe um aluno com o mesmo CPF ou matrícula
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        OR: [
          { cpf },
          { matricula },
        ],
      },
    });

    if (alunoExistente) {
      console.log("Aluno já existe:", alunoExistente);
      return NextResponse.json(
        { error: "Já existe um aluno com este CPF ou matrícula" },
        { status: 400 }
      );
    }

    // Verificar se já existe um usuário com o mesmo email
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      console.log("Usuário já existe:", usuarioExistente);
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 400 }
      );
    }

    // Buscar a turma para obter a escola
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        escola: true,
      },
    });

    if (!turma) {
      console.log("Turma não encontrada:", turmaId);
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    console.log("Iniciando transação para criar aluno...");
    // Criar o aluno e o usuário em uma transação
    const aluno = await prisma.$transaction(async (tx) => {
      // Criar o usuário primeiro
      const user = await tx.user.create({
        data: {
          email,
          name: nome,
          role: "ALUNO",
          // Senha temporária que será alterada no primeiro login
          password: await hash("123456", 10),
        },
      });

      console.log("Usuário criado:", user);

      // Criar o aluno
      const novoAluno = await tx.aluno.create({
        data: {
          userId: user.id,
          matricula,
          cpf,
          dataNascimento: new Date(dataNascimento),
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          email,
          sexo: Sexo.OUTRO,
          nomeMae: "",
          nomePai: "",
          dataMatricula: new Date(),
          situacao: Situacao.ATIVO,
          turmas: {
            create: {
              turmaId,
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
                include: {
                  escola: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      console.log("Aluno criado:", novoAluno);

      return {
        id: novoAluno.id,
        nome: novoAluno.user.name,
        email: novoAluno.user.email,
        matricula: novoAluno.matricula,
        escola: novoAluno.turmas[0]?.turma.escola || null,
      };
    });

    console.log("Transação concluída com sucesso");
    return NextResponse.json(aluno);
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 