"use client";

import { Alert } from "@/components/ui/Alert";
import { getAdminDashboardStats, AdminDashboardStats } from "@/lib/actions/dashboard";
import { Container } from "@/components/layout/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Suspense, useEffect, useState } from "react";
import { DashboardCard } from "./DashboardCard";
import { ActivityFeed } from "./ActivityFeed";
import { MetricsOverview } from "./MetricsOverview";
import { DashboardLoading } from "./DashboardLoading";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Tipos de cards disponíveis
type CardType = "stat" | "metric" | "activity" | "chart";

// Interface base para todos os cards
interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

// Interface específica para cards de estatística
interface StatCard extends BaseCard {
  type: "stat";
  valueKey: keyof AdminDashboardStats;
  href: string;
  iconName: string;
}

// Interface específica para cards de métrica
interface MetricCard extends BaseCard {
  type: "metric";
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

// Interface específica para cards de atividade
interface ActivityCard extends BaseCard {
  type: "activity";
  activities: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: "success" | "warning" | "info";
  }>;
}

// Interface específica para cards de gráfico
interface ChartCard extends BaseCard {
  type: "chart";
  chartType: "line" | "bar" | "pie";
  data: any;
}

type DashboardCard = StatCard | MetricCard | ActivityCard | ChartCard;

const statCards: StatCard[] = [
  {
    id: "escolas",
    type: "stat",
    title: "Escolas",
    valueKey: "totalEscolas",
    description: "Total de escolas cadastradas",
    iconName: "Building2",
    href: "/admin/escolas",
    gradient: "from-blue-500 to-blue-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    id: "turmas",
    type: "stat",
    title: "Turmas",
    valueKey: "totalTurmas",
    description: "Em funcionamento",
    iconName: "BookOpen",
    href: "/admin/turmas",
    gradient: "from-rose-400 to-pink-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    id: "professores",
    type: "stat",
    title: "Professores",
    valueKey: "totalProfessores",
    description: "Corpo docente ativo",
    iconName: "GraduationCap",
    href: "/admin/professores",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    id: "alunos",
    type: "stat",
    title: "Alunos",
    valueKey: "totalAlunos",
    description: "Matriculados atualmente",
    iconName: "Users",
    href: "/admin/alunos",
    gradient: "from-amber-400 to-yellow-300",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  }
];

const metricCards: MetricCard[] = [
  {
    id: "crescimento-alunos",
    type: "metric",
    title: "Crescimento de Alunos",
    description: "Últimos 30 dias",
    iconName: "TrendingUp",
    value: 12,
    change: 8.5,
    trend: "up",
    gradient: "from-emerald-500 to-emerald-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  },
  {
    id: "taxa-matricula",
    type: "metric",
    title: "Taxa de Matrícula",
    description: "Este mês",
    iconName: "CheckCircle2",
    value: 94,
    change: -2.1,
    trend: "down",
    gradient: "from-orange-500 to-orange-400",
    iconBg: "bg-white/20",
    iconColor: "text-white"
  }
];

export function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        console.log("[Dashboard] Iniciando carregamento de estatísticas...");
        const response = await fetch("/api/admin/dashboard");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao carregar estatísticas");
        }

        const data = await response.json();
        console.log("[Dashboard] Estatísticas carregadas com sucesso:", data);
        setStats(data);
      } catch (err) {
        console.error("[Dashboard] Erro ao carregar estatísticas:", err);
        setError(err instanceof Error ? err.message : "Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-6">
        <Container>
          <DashboardLoading />
        </Container>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-6">
        <Container>
          <div className="space-y-4">
            <Alert variant="error" className="mb-6">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Erro ao carregar o dashboard</p>
                <p className="text-sm text-gray-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Tentar novamente
                </button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel de Controle
          </h1>
          <p className="text-gray-500">
            Bem-vindo ao painel administrativo. Aqui você pode gerenciar todas as operações do sistema.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {statCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DashboardCard card={card} stats={stats} />
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <MetricsOverview stats={stats} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ActivityFeed />
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MetricsOverview stats={stats} detailed />
            </motion.div>
          </TabsContent>

          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ActivityFeed detailed />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 