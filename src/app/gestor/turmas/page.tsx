import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getGestorByUserId } from "@/lib/actions/gestor";
import { getTurmasByEscola, Turma } from "@/lib/actions/turma";
import { Metadata } from "next";
import { TurmasContent } from "./components/TurmasContent";

export const metadata: Metadata = {
  title: "Turmas",
  description: "Página de gerenciamento de turmas",
};

export default async function TurmasPage() {
  let turmas: Turma[] = [];
  let error: string | null = null;
  let escolaId: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.GESTOR) {
    redirect("/login");
  }

  // Busca dados do gestor e escola usando a action
  const gestor = await getGestorByUserId(session.user.id);

  if (!gestor || gestor.escolas.length === 0) {
    throw new Error("Gestor não encontrado ou sem escolas");
  }

  escolaId = gestor.escolas[0].id;

  // Busca as turmas da escola usando a action
  try {
    turmas = await getTurmasByEscola(escolaId);
  } catch (err) {
    error = "Não foi possível carregar as turmas";
    console.error("Erro ao buscar turmas:", err);
  }

  if (error || !escolaId) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error || "Não foi possível carregar os dados das turmas"}
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TurmasContent 
            turmasIniciais={turmas} 
          />
        </div>
      </div>
    </div>
  );
} 