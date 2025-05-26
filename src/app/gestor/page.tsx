import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getGestorByUserId, gestorHasEscolas } from "@/lib/actions/gestor";
import { getTurmasByEscola } from "@/lib/actions/turma";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { Metadata } from "next";
import { DashboardContent } from "./components/DashboardContent";

interface Turma {
  id: string;
  nome: string;
  turno: string;
  _count: {
    alunos: number;
    professores: number;
    disciplinas: number;
  };
}

interface DashboardStats {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  totalDisciplinas: number;
}

export const metadata: Metadata = {
  title: "Dashboard do Gestor",
  description: "Painel de controle do gestor escolar",
};

export default async function GestorDashboard() {
  let turmas: Turma[] = [];
  let stats: DashboardStats | null = null;
  let error: string | null = null;
  let escolaId: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.GESTOR) {
    redirect("/login");
  }

  // Busca dados do gestor e escola usando a action
  const gestor = await getGestorByUserId(session.user.id);

  if (!gestor) {
    error = "Gestor não encontrado";
  } else {
    // Verifica se o gestor tem escolas
    const hasEscolas = await gestorHasEscolas(gestor.id);

    if (!hasEscolas || gestor.escolas.length === 0) {
      error = "Gestor não possui escolas associadas";
    } else {
      escolaId = gestor.escolas[0].id;
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Busca as turmas e estatísticas da escola usando as actions
  try {
    const [turmasData, statsData] = await Promise.all([
      getTurmasByEscola(escolaId!),
      getDashboardStats(escolaId!),
    ]);

    turmas = turmasData as Turma[];
    stats = statsData as DashboardStats;
  } catch (err) {
    error = "Não foi possível carregar os dados do dashboard";
  }

  if (error || !escolaId || !stats) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error || "Não foi possível carregar os dados do dashboard"}
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        <div className="">
          <DashboardContent turmasIniciais={turmas} statsIniciais={stats} />
        </div>
      </div>
    </div>
  );
}
