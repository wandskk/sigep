"use client";

import { Card } from "@/components/ui/Card";
import { Activity, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActivityFeedProps {
  detailed?: boolean;
}

// Dados mockados para exemplo - em produção, isso viria de uma API
const mockActivities = [
  {
    id: "1",
    title: "Nova matrícula realizada",
    description: "João Silva foi matriculado na turma 9º Ano A",
    timestamp: "há 5 minutos",
    type: "success" as const
  },
  {
    id: "2",
    title: "Atualização de notas",
    description: "Professor Maria atualizou as notas da turma 8º Ano B",
    timestamp: "há 15 minutos",
    type: "info" as const
  },
  {
    id: "3",
    title: "Alerta de frequência",
    description: "Pedro Santos atingiu 25% de faltas no mês",
    timestamp: "há 1 hora",
    type: "warning" as const
  },
  {
    id: "4",
    title: "Nova turma criada",
    description: "Turma 7º Ano C foi criada na Escola Municipal",
    timestamp: "há 2 horas",
    type: "success" as const
  },
  {
    id: "5",
    title: "Professor adicionado",
    description: "Ana Oliveira foi adicionada como professora de Matemática",
    timestamp: "há 3 horas",
    type: "info" as const
  }
];

const getActivityIcon = (type: "success" | "warning" | "info") => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export function ActivityFeed({ detailed = false }: ActivityFeedProps) {
  const activities = detailed ? mockActivities : mockActivities.slice(0, 3);

  return (
    <Card className="h-full bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-lg">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {detailed ? "Histórico de Atividades" : "Atividades Recentes"}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex gap-3 p-4 rounded-lg transition-all duration-200",
                "hover:bg-gray-50/80 hover:shadow-sm",
                "border border-transparent hover:border-gray-100"
              )}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  activity.type === "success" && "bg-emerald-500/10 text-emerald-500",
                  activity.type === "warning" && "bg-amber-500/10 text-amber-500",
                  activity.type === "info" && "bg-blue-500/10 text-blue-500"
                )}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {!detailed && activities.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-4 border-t border-gray-100"
          >
            <button
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
              onClick={() => {/* Implementar navegação para view detalhada */}}
            >
              Ver todas as atividades
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block"
              >
                →
              </motion.span>
            </button>
          </motion.div>
        )}
      </div>
    </Card>
  );
} 