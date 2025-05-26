import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { SchoolsClient } from "@/components/schools/SchoolsClient";
import SchoolsLoading from "./loading";
import { Container } from "@/components/layout/Container";

async function getSchools() {
  try {
    return await prisma.school.findMany({
      include: {
        gestor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    throw new Error("Não foi possível carregar as escolas");
  }
}

export default async function SchoolsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/signin");
  }

  return (
    <Container>
      <Suspense fallback={<SchoolsLoading />}>
        <SchoolsContentWrapper />
      </Suspense>
    </Container>
  );
}

async function SchoolsContentWrapper() {
  const schools = await getSchools();

  return <SchoolsClient initialSchools={schools} />;
}
