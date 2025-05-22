const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Enumeração de papéis de usuário
const UserRole = {
  ALUNO: 'ALUNO',
  PROFESSOR: 'PROFESSOR',
  GESTOR: 'GESTOR',
  SECRETARIA: 'SECRETARIA',
  ADMIN: 'ADMIN'
};

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes para evitar duplicações
  await cleanDatabase();

  // Criar usuários para cada tipo de perfil
  await createUsers();

  console.log('Seed concluído com sucesso!');
}

async function cleanDatabase() {
  console.log('Limpando banco de dados...');

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

  console.log('Banco de dados limpo!');
}

async function createUsers() {
  console.log('Criando usuários...');

  // Senha padrão para todos os usuários: 'senha123'
  const defaultPassword = await bcrypt.hash('senha123', 10);

  // 1. Criar administrador
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@sigep.com',
      password: defaultPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Administrador criado: ${admin.email}`);

  // 2. Criar usuário da Secretaria
  const secretariaUser = await prisma.user.create({
    data: {
      name: 'Ana Silva',
      email: 'secretaria@sigep.com',
      password: defaultPassword,
      role: UserRole.SECRETARIA,
      secretaria: {
        create: {
          departamento: 'Secretaria Municipal de Educação',
          cargo: 'Coordenador Administrativo',
        },
      },
    },
    include: {
      secretaria: true,
    },
  });
  console.log(`Usuário da Secretaria criado: ${secretariaUser.email}`);

  // 3. Criar gestor escolar
  const gestorUser = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'gestor@sigep.com',
      password: defaultPassword,
      role: UserRole.GESTOR,
      gestor: {
        create: {
          cargo: 'Diretor',
        },
      },
    },
    include: {
      gestor: true,
    },
  });
  console.log(`Gestor criado: ${gestorUser.email}`);

  // 4. Criar professores
  const professor1 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'professor1@sigep.com',
      password: defaultPassword,
      role: UserRole.PROFESSOR,
      professor: {
        create: {
          formacao: 'Licenciatura em Matemática',
          especialidade: 'Álgebra e Geometria',
        },
      },
    },
    include: {
      professor: true,
    },
  });
  console.log(`Professor criado: ${professor1.email}`);

  const professor2 = await prisma.user.create({
    data: {
      name: 'João Costa',
      email: 'professor2@sigep.com',
      password: defaultPassword,
      role: UserRole.PROFESSOR,
      professor: {
        create: {
          formacao: 'Licenciatura em Português',
          especialidade: 'Literatura e Redação',
        },
      },
    },
    include: {
      professor: true,
    },
  });
  console.log(`Professor criado: ${professor2.email}`);

  // 5. Criar alunos
  const aluno1 = await prisma.user.create({
    data: {
      name: 'Pedro Almeida',
      email: 'aluno1@sigep.com',
      password: defaultPassword,
      role: UserRole.ALUNO,
      aluno: {
        create: {
          matricula: '20240001',
          dataNascimento: new Date('2008-05-15'),
          responsavel: 'Mariana Almeida',
          telefone: '(84) 99999-1111',
          endereco: 'Rua das Flores, 123 - Baraúna/RN',
        },
      },
    },
    include: {
      aluno: true,
    },
  });
  console.log(`Aluno criado: ${aluno1.email}`);

  const aluno2 = await prisma.user.create({
    data: {
      name: 'Júlia Ferreira',
      email: 'aluno2@sigep.com',
      password: defaultPassword,
      role: UserRole.ALUNO,
      aluno: {
        create: {
          matricula: '20240002',
          dataNascimento: new Date('2007-10-22'),
          responsavel: 'Roberto Ferreira',
          telefone: '(84) 99999-2222',
          endereco: 'Av. Principal, 456 - Baraúna/RN',
        },
      },
    },
    include: {
      aluno: true,
    },
  });
  console.log(`Aluno criado: ${aluno2.email}`);

  const aluno3 = await prisma.user.create({
    data: {
      name: 'Lucas Rodrigues',
      email: 'aluno3@sigep.com',
      password: defaultPassword,
      role: UserRole.ALUNO,
      aluno: {
        create: {
          matricula: '20240003',
          dataNascimento: new Date('2009-03-10'),
          responsavel: 'Fernanda Rodrigues',
          telefone: '(84) 99999-3333',
          endereco: 'Rua do Comércio, 789 - Baraúna/RN',
        },
      },
    },
    include: {
      aluno: true,
    },
  });
  console.log(`Aluno criado: ${aluno3.email}`);
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Fechar a conexão com o banco de dados ao terminar
    await prisma.$disconnect();
  }); 