import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassesClient } from "@/components/classes/ClassesClient";
import { Container } from "@/components/layout/Container";

export const dynamic = "force-dynamic";

export default async function TurmasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const [turmas, escolas] = await Promise.all([
    prisma.turma.findMany({
      select: {
        id: true,
        nome: true,
        codigo: true,
        turno: true,
        escolaId: true,
        createdAt: true,
        updatedAt: true,
        escola: {
          select: {
            id: true,
            name: true,
          },
        },
        alunos: {
          include: {
            aluno: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.school.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <Container>
      <ClassesClient turmas={turmas} escolas={escolas} />
    </Container>
  );
} 