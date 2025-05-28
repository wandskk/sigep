import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getAllAlunos } from "@/lib/actions/aluno";
import { formatarAlunos, AlunoFormatado } from "@/lib/utils/aluno/index";
import { Metadata } from "next";
import { AlunosAdminContent } from "./components/AlunosAdminContent";
import { Container } from "@/components/layout/Container";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Alunos - Admin",
  description: "Página de gerenciamento de todos os alunos do sistema",
};

export default async function AlunosAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gerencie os alunos cadastrados no sistema
        </p>
      </div>

      <AlunosAdminContent />
    </div>
  );
} 