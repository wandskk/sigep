import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole, School, User, Turma } from "@prisma/client";
import { SchoolDetailsClient } from "@/components/schools/SchoolDetailsClient";

type SchoolWithRelations = School & {
  gestor: {
    user: User;
  } | null;
  professores: {
    user: User;
  }[];
  turmas: (Turma & {
    _count: {
      alunos: number;
    };
  })[];
};

async function getSchool(id: string) {
  try {
    const school = (await prisma.school.findUnique({
      where: { id },
      include: {
        gestor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                password: true,
                role: true,
                image: true,
                firstLogin: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        professores: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                password: true,
                role: true,
                image: true,
                firstLogin: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        turmas: {
          include: {
            _count: {
              select: {
                alunos: true,
              },
            },
          },
        },
      },
    })) as SchoolWithRelations | null;

    if (!school) {
      return null;
    }

    // Transformar os dados para o formato esperado pelo componente
    return {
      ...school,
      gestor: school.gestor?.user || null,
      professors: school.professores.map((p) => p.user),
      classes: school.turmas.map((turma) => ({
        id: turma.id,
        name: turma.nome,
        grade: parseInt(turma.codigo.split(".")[0]) || 1,
        period: turma.turno.toLowerCase(),
        _count: {
          alunos: turma._count.alunos,
        },
      })),
    };
  } catch (error) {
    throw new Error("Não foi possível carregar os detalhes da escola");
  }
}

export default async function SchoolDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const school = await getSchool(id);

  if (!school) {
    notFound();
  }

  return <SchoolDetailsClient school={school} />;
}
