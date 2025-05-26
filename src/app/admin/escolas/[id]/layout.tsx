import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import EscolaLayoutClient from "./EscolaLayoutClient";

export default async function EscolaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
    },
  });

  if (!school) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Escola não encontrada
      </div>
    );
  }

  return <EscolaLayoutClient school={school}>{children}</EscolaLayoutClient>;
}
