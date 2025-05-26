import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/auth/prisma-adapter";

// Função para criar a seed do banco de dados
async function seedDatabase() {
  try {
    // Limpar dados existentes
    await cleanDatabase();

    // Criar usuários
    await createUsers();

    return { success: true, message: "Seed concluído com sucesso!" };
  } catch (error) {
    return { 
      success: false, 
      message: "Erro ao executar seed", 
      error: (error as Error).message 
    };
  }
}

// Limpar banco de dados
async function cleanDatabase() {
  // A ordem é importante devido às relações de chave estrangeira
  await prisma.secretaria.deleteMany();
  await prisma.gestor.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.aluno.deleteMany();
  
  await prisma.passwordReset.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

// Criar usuários
async function createUsers() {
  // Senha padrão para todos os usuários: 'senha123'
  const defaultPassword = await hash("senha123", 10);

  // 1. Criar administrador
  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@sigep.com",
      password: defaultPassword,
      role: "ADMIN",
    },
  });

  // 2. Criar usuário da Secretaria
  const secretariaUser = await prisma.user.create({
    data: {
      name: "Ana Silva",
      email: "secretaria@sigep.com",
      password: defaultPassword,
      role: "SECRETARIA",
      secretaria: {
        create: {
          departamento: "Secretaria Municipal de Educação",
          cargo: "Coordenador Administrativo",
        },
      },
    },
    include: {
      secretaria: true,
    },
  });

  // 3. Criar gestor escolar
  const gestorUser = await prisma.user.create({
    data: {
      name: "Carlos Oliveira",
      email: "gestor@sigep.com",
      password: defaultPassword,
      role: "GESTOR",
      gestor: {
        create: {
          cargo: "Diretor",
        },
      },
    },
    include: {
      gestor: true,
    },
  });

  // 4. Criar professores
  const professor1 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "professor1@sigep.com",
      password: defaultPassword,
      role: "PROFESSOR",
      professor: {
        create: {
          formacao: "Licenciatura em Matemática",
          especialidade: "Álgebra e Geometria",
        },
      },
    },
    include: {
      professor: true,
    },
  });

  const professor2 = await prisma.user.create({
    data: {
      name: "João Costa",
      email: "professor2@sigep.com",
      password: defaultPassword,
      role: "PROFESSOR",
      professor: {
        create: {
          formacao: "Licenciatura em Português",
          especialidade: "Literatura e Redação",
        },
      },
    },
    include: {
      professor: true,
    },
  });

  // 5. Criar alunos e seus responsáveis
  const aluno1 = await prisma.user.create({
    data: {
      name: "Pedro Almeida",
      email: "aluno1@sigep.com",
      password: defaultPassword,
      role: "ALUNO",
      aluno: {
        create: {
          matricula: "20240001",
          dataNascimento: new Date("2008-05-15"),
          sexo: "M",
          cpf: "12345678900",
          nis: "12345678901",
          endereco: "Rua das Flores, 123",
          cidade: "Baraúna",
          estado: "RN",
          cep: "59695-000",
          telefone: "84999991111",
          email: "pedro.almeida@email.com",
          nomeMae: "Mariana Almeida",
          nomePai: "José Almeida",
          dataMatricula: new Date(),
          situacao: "ATIVO",
        },
      },
    },
    include: {
      aluno: true,
    },
  });

  // Criar responsável do aluno 1
  await prisma.responsavel.create({
    data: {
      nome: "Mariana Almeida",
      cpf: "98765432100",
      email: "mariana.almeida@email.com",
      telefone: "84999991111",
      parentesco: "MAE",
      alunoId: aluno1.aluno!.id,
      endereco: "Rua das Flores, 123"
    },
  });

  const aluno2 = await prisma.user.create({
    data: {
      name: "Júlia Ferreira",
      email: "aluno2@sigep.com",
      password: defaultPassword,
      role: "ALUNO",
      aluno: {
        create: {
          matricula: "20240002",
          dataNascimento: new Date("2007-10-22"),
          sexo: "F",
          cpf: "23456789001",
          nis: "23456789002",
          endereco: "Av. Principal, 456",
          cidade: "Baraúna",
          estado: "RN",
          cep: "59695-000",
          telefone: "84999992222",
          email: "julia.ferreira@email.com",
          nomeMae: "Roberta Ferreira",
          nomePai: "Roberto Ferreira",
          dataMatricula: new Date(),
          situacao: "ATIVO",
        },
      },
    },
    include: {
      aluno: true,
    },
  });

  // Criar responsável do aluno 2
  await prisma.responsavel.create({
    data: {
      nome: "Roberto Ferreira",
      cpf: "87654321001",
      email: "roberto.ferreira@email.com",
      telefone: "84999992222",
      parentesco: "PAI",
      alunoId: aluno2.aluno!.id,
      endereco: "Av. Principal, 456"
    },
  });

  const aluno3 = await prisma.user.create({
    data: {
      name: "Lucas Rodrigues",
      email: "aluno3@sigep.com",
      password: defaultPassword,
      role: "ALUNO",
      aluno: {
        create: {
          matricula: "20240003",
          dataNascimento: new Date("2009-03-10"),
          sexo: "M",
          cpf: "34567890102",
          nis: "34567890103",
          endereco: "Rua do Comércio, 789",
          cidade: "Baraúna",
          estado: "RN",
          cep: "59695-000",
          telefone: "84999993333",
          email: "lucas.rodrigues@email.com",
          nomeMae: "Fernanda Rodrigues",
          nomePai: "Paulo Rodrigues",
          dataMatricula: new Date(),
          situacao: "ATIVO",
        },
      },
    },
    include: {
      aluno: true,
    },
  });

  // Criar responsável do aluno 3
  await prisma.responsavel.create({
    data: {
      nome: "Fernanda Rodrigues",
      cpf: "76543210002",
      email: "fernanda.rodrigues@email.com",
      telefone: "84999993333",
      parentesco: "MAE",
      alunoId: aluno3.aluno!.id,
      endereco: "Rua do Comércio, 789"
    },
  });
}

// Handler para GET
export async function GET() {
  // Verificar se estamos em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Esta rota só está disponível em ambiente de desenvolvimento" },
      { status: 403 }
    );
  }

  const result = await seedDatabase();
  
  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  } else {
    return NextResponse.json(result, { status: 500 });
  }
} 