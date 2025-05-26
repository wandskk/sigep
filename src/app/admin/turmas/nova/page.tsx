import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/classes/ClassForm";
import { Container } from "@/components/layout/Container";

export const dynamic = "force-dynamic";

export default async function NovaTurmaPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Container>
      <ClassForm schools={schools} />
    </Container>
  );
} 