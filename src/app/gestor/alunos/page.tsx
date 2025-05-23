import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getGestorByUserId } from "@/lib/actions/gestor";
import { getAlunosByEscola } from "@/lib/actions/aluno";
import { formatarAlunos, AlunoFormatado } from "@/lib/utils/aluno/index";
import { Metadata } from "next";
import { AlunosContent } from "./components/AlunosContent";

export const metadata: Metadata = {
  title: "Alunos",
  description: "Página de gerenciamento de alunos",
};

export default async function AlunosPage() {
  const alunos: AlunoFormatado[] = [];
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

  // Busca os alunos da escola usando a action
  const alunosData = await getAlunosByEscola(escolaId);
  Object.assign(alunos, formatarAlunos(alunosData));

  if (error || !escolaId) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error || "Não foi possível carregar os dados dos alunos"}
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
          <AlunosContent 
            alunosIniciais={alunos} 
            escolaId={escolaId} 
          />
        </div>
      </div>
    </div>
  );
}
