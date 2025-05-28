"use client";

import { Card } from "@/components/ui/Card";
import { AdminDashboardStats } from "@/lib/actions/dashboard";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricsOverviewProps {
  stats: AdminDashboardStats;
  detailed?: boolean;
}

// Dados mockados para exemplo - em produção, isso viria de uma API
const mockMetrics = {
  crescimentoAlunos: {
    mensal: 12,
    trimestral: 35,
    anual: 120
  },
  taxaMatricula: {
    atual: 94,
    anterior: 96,
    tendencia: -2.1
  },
  distribuicaoTurmas: [
    { serie: "6º Ano", quantidade: 8 },
    { serie: "7º Ano", quantidade: 7 },
    { serie: "8º Ano", quantidade: 6 },
    { serie: "9º Ano", quantidade: 5 }
  ],
  distribuicaoProfessores: [
    { disciplina: "Matemática", quantidade: 12 },
    { disciplina: "Português", quantidade: 10 },
    { disciplina: "História", quantidade: 8 },
    { disciplina: "Geografia", quantidade: 8 },
    { disciplina: "Ciências", quantidade: 9 }
  ]
};

const metricCards = [
  {
    id: "crescimento",
    title: "Crescimento de Alunos",
    iconName: "TrendingUp",
    gradient: "from-emerald-500 to-emerald-400",
    metrics: [
      { label: "Mensal", value: mockMetrics.crescimentoAlunos.mensal, suffix: "%" },
      { label: "Trimestral", value: mockMetrics.crescimentoAlunos.trimestral, suffix: "%" },
      { label: "Anual", value: mockMetrics.crescimentoAlunos.anual, suffix: "%" }
    ]
  },
  {
    id: "matricula",
    title: "Taxa de Matrícula",
    iconName: "Users",
    gradient: "from-blue-500 to-blue-400",
    metrics: [
      { label: "Atual", value: mockMetrics.taxaMatricula.atual, suffix: "%" },
      { label: "Anterior", value: mockMetrics.taxaMatricula.anterior, suffix: "%" },
      { label: "Tendência", value: mockMetrics.taxaMatricula.tendencia, suffix: "%", isChange: true }
    ]
  }
];

export function MetricsOverview({ stats, detailed = false }: MetricsOverviewProps) {
  return (
    <Card className="h-full bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-lg">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          {Icons.BarChart3 && (
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Icons.BarChart3 className="w-5 h-5" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900">
            {detailed ? "Métricas Detalhadas" : "Visão Geral das Métricas"}
          </h2>
        </motion.div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {metricCards.map((card, index) => {
            const Icon = Icons[card.iconName as keyof typeof Icons];
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-xl p-6 bg-gradient-to-br shadow-lg",
                  card.gradient,
                  "text-white overflow-hidden",
                  "hover:shadow-xl hover:shadow-black/5 transition-all duration-300",
                  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                )}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <h3 className="font-medium text-lg">{card.title}</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {card.metrics.map((metric, idx) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                      className="text-center"
                    >
                      <div className="text-sm opacity-90 mb-1">{metric.label}</div>
                      <div className={cn(
                        "text-2xl font-bold",
                        metric.isChange && metric.value < 0 ? "text-red-200" :
                        metric.isChange && metric.value > 0 ? "text-emerald-200" :
                        "text-white"
                      )}>
                        {metric.value}{metric.suffix}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {detailed && (
          <>
            {/* Distribuição de Turmas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  {Icons.BookOpen && <Icons.BookOpen className="w-4 h-4" />}
                </div>
                Distribuição de Turmas por Série
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mockMetrics.distribuicaoTurmas.map((item, index) => (
                  <motion.div
                    key={item.serie}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.05) }}
                    className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm text-gray-500 mb-1">{item.serie}</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {item.quantidade}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Distribuição de Professores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                  {Icons.GraduationCap && <Icons.GraduationCap className="w-4 h-4" />}
                </div>
                Distribuição de Professores por Disciplina
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {mockMetrics.distribuicaoProfessores.map((item, index) => (
                  <motion.div
                    key={item.disciplina}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.05) }}
                    className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm text-gray-500 mb-1">{item.disciplina}</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {item.quantidade}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Card>
  );
} 