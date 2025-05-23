import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfessoresContent } from "./components/ProfessoresContent";
import { Loader } from "@/components/ui/Loader";

export default async function ProfessoresPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

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

  const professoresFormatados = professores.map((professor) => ({
    id: professor.id,
    nome: professor.name,
    email: professor.email,
    escola: professor.professor?.escola ? {
      id: professor.professor.escola.id,
      nome: professor.professor.escola.name,
    } : null,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader size="lg" variant="primary" text="Carregando..." />
          </div>
        }
      >
        <ProfessoresContent
          professoresIniciais={professoresFormatados}
          escolas={escolas.map(escola => ({
            id: escola.id,
            name: escola.name,
          }))}
        />
      </Suspense>
    </div>
  );
} 