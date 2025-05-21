import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt-ts-edge";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Criar roles padrão
  await createRoles();

  // Criar usuário administrador padrão
  await createAdminUser();

  console.log("Seed concluído com sucesso!");
}

async function createRoles() {
  const roles = [
    {
      name: "admin",
      description: "Administrador do sistema",
      permissions: [
        "manage_users",
        "manage_schools",
        "manage_courses",
        "manage_classes",
        "manage_teachers",
        "manage_students",
        "view_reports",
        "manage_roles",
        "manage_system",
      ],
    },
    {
      name: "secretaria",
      description: "Secretaria Municipal de Educação",
      permissions: [
        "view_all_schools",
        "view_reports",
        "manage_schools",
        "manage_courses",
        "view_all_users",
      ],
    },
    {
      name: "gestor",
      description: "Gestor escolar",
      permissions: [
        "manage_school",
        "manage_school_teachers",
        "manage_school_students",
        "manage_school_classes",
        "view_school_reports",
      ],
    },
    {
      name: "professor",
      description: "Professor",
      permissions: [
        "view_assigned_classes",
        "manage_grades",
        "manage_attendance",
        "view_students_performance",
      ],
    },
    {
      name: "aluno",
      description: "Aluno",
      permissions: ["view_own_profile", "view_own_grades", "view_own_attendance"],
    },
  ];

  console.log("Criando roles padrão...");

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role,
      });
      console.log(`Role "${role.name}" criada com sucesso!`);
    } else {
      console.log(`Role "${role.name}" já existe, atualizando permissões...`);
      await prisma.role.update({
        where: { id: existingRole.id },
        data: { permissions: role.permissions },
      });
    }
  }
}

async function createAdminUser() {
  console.log("Verificando usuário administrador...");

  const adminEmail = "admin@sigep.gov.br";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Usuário administrador já existe!");
    return;
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Role de administrador não encontrada!");
  }

  const hashedPassword = await hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      name: "Administrador",
      email: adminEmail,
      hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Usuário administrador criado com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Erro durante o seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  }); 