import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { ProfessoresContent } from "./components/ProfessoresContent";
import ProfessoresLoading from "./loading";
import { Container } from "@/components/layout/Container";

async function getProfessores() {
  try {
    const [professores, escolas] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "PROFESSOR",
        },
        select: {
          id: true,
          name: true,
          email: true,
          professor: {
            select: {
              escola: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
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

    return {
      professores: professores.map((professor) => ({
        id: professor.id,
        nome: professor.name,
        email: professor.email,
        escola: professor.professor?.escola ? {
          id: professor.professor.escola.id,
          nome: professor.professor.escola.name,
        } : null,
      })),
      escolas: escolas.map(escola => ({
        id: escola.id,
        name: escola.name,
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    throw new Error("Não foi possível carregar os professores");
  }
}

export default async function ProfessoresPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/signin");
  }

  return (
    <Container>
      <Suspense fallback={<ProfessoresLoading />}>
        <ProfessoresContentWrapper />
      </Suspense>
    </Container>
  );
}

async function ProfessoresContentWrapper() {
  const { professores, escolas } = await getProfessores();
  return <ProfessoresContent professoresIniciais={professores} escolas={escolas} />;
} 