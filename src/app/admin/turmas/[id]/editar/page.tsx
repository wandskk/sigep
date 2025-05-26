import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/classes/ClassForm";
import { Container } from "@/components/layout/Container";

export const dynamic = "force-dynamic";

interface EditClassPageProps {
  params: {
    id: string;
  };
}

export default async function EditClassPage({ params }: EditClassPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const [turma, schools] = await Promise.all([
    prisma.turma.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        turno: true,
        escolaId: true,
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

  if (!turma) {
    notFound();
  }

  return (
    <Container>
      <ClassForm schools={schools} initialData={turma} />
    </Container>
  );
} 