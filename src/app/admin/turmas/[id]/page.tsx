import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassDetailsClient } from "@/components/classes/ClassDetailsClient";
import { Container } from "@/components/layout/Container";

export const dynamic = "force-dynamic";

interface ClassDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const turma = await prisma.turma.findUnique({
    where: {
      id: params.id,
    },
    include: {
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
  });

  if (!turma) {
    notFound();
  }

  return (
    <Container>
      <ClassDetailsClient turma={turma} />
    </Container>
  );
} 