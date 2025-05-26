import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getAdminDashboardStats, AdminDashboardStats } from "@/lib/actions/dashboard";
import { Building2, Users, GraduationCap, BookOpen, School, UserCog } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

const cards = [
  {
    title: "Escolas",
    valueKey: "totalEscolas",
    description: "Total de escolas cadastradas",
    icon: Building2,
    href: "/admin/escolas",
    gradient: "from-blue-500 to-blue-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    title: "Turmas",
    valueKey: "totalTurmas",
    description: "Em funcionamento",
    icon: BookOpen,
    href: "/admin/turmas",
    gradient: "from-rose-400 to-pink-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    title: "Professores",
    valueKey: "totalProfessores",
    description: "Corpo docente ativo",
    icon: GraduationCap,
    href: "/admin/professores",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    title: "Alunos",
    valueKey: "totalAlunos",
    description: "Matriculados atualmente",
    icon: Users,
    href: "/admin/alunos",
    gradient: "from-amber-400 to-yellow-300",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    title: "Usuários",
    valueKey: "totalUsuarios",
    description: "Total de usuários no sistema",
    icon: UserCog,
    href: "/admin/usuarios",
    gradient: "from-indigo-500 to-indigo-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
];

export default async function AdminDashboard() {
  let stats: AdminDashboardStats | null = null;
  let error: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  // Busca as estatísticas usando a action
  try {
    stats = await getAdminDashboardStats();
  } catch (err) {
    error = "Não foi possível carregar os dados do dashboard";
  }

  if (error || !stats) {
    return (
      <div className="bg-blue-50 min-h-screen w-full">
        <Container>
          <Alert variant="error" className="mb-6">
            {error || "Não foi possível carregar os dados do dashboard"}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
      <Container>
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard do Administrador
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao painel de controle do sistema
            </p>
          </div>
        </div>

        {/* Grid de Acesso Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            let value = stats[card.valueKey as keyof typeof stats] ?? 0;
            if (card.valueKey === "totalUsuarios") {
              value = (stats.totalGestores ?? 0) + (stats.totalProfessores ?? 0) + (stats.totalAlunos ?? 0);
            }
            return (
              <Link href={card.href} key={card.title} className="block h-full">
                <div
                  className={`relative h-full rounded-xl shadow-md p-6 bg-gradient-to-br ${card.gradient} text-white overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg`}
                >
                  {/* Ícone no canto superior direito */}
                  <div className="absolute top-4 right-4">
                    <div className={`rounded-lg p-2 ${card.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                  </div>
                  {/* Conteúdo */}
                  <div className="flex flex-col gap-2 h-full">
                    <span className="font-medium text-base mb-2">{card.title}</span>
                    <span className="text-3xl font-bold">{value}</span>
                    <span className="text-sm opacity-90">{card.description}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
} 