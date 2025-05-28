"use client";

import { Card } from "@/components/ui/Card";
import { AdminDashboardStats } from "@/lib/actions/dashboard";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

type CardType = "stat" | "metric" | "activity" | "chart";

interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  iconName: keyof typeof Icons;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

interface StatCard extends BaseCard {
  type: "stat";
  valueKey: keyof AdminDashboardStats;
  href: string;
}

interface MetricCard extends BaseCard {
  type: "metric";
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
}

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

interface ChartCard extends BaseCard {
  type: "chart";
  chartType: "line" | "bar" | "pie";
  data: any;
}

type DashboardCardProps = {
  card: StatCard | MetricCard | ActivityCard | ChartCard;
  stats: AdminDashboardStats;
};

export function DashboardCard({ card, stats }: DashboardCardProps) {
  const Icon = Icons[card.iconName];

  const renderCardContent = () => {
    switch (card.type) {
      case "stat":
        const value = stats[card.valueKey] ?? 0;
        return (
          <Link href={card.href} className="block h-full">
            <div className="flex flex-col gap-2 h-full">
              <span className="font-medium text-base mb-2">{card.title}</span>
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-sm opacity-90">{card.description}</span>
            </div>
          </Link>
        );

      case "metric":
        return (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-medium text-base mb-2">{card.title}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{card.value}</span>
              <div className={cn(
                "flex items-center text-sm font-medium",
                card.trend === "up" ? "text-emerald-600" : 
                card.trend === "down" ? "text-red-600" : 
                "text-gray-600"
              )}>
                {card.trend === "up" && <ArrowUp className="w-4 h-4" />}
                {card.trend === "down" && <ArrowDown className="w-4 h-4" />}
                {card.trend === "neutral" && <Minus className="w-4 h-4" />}
                <span>{Math.abs(card.change)}%</span>
              </div>
            </div>
            <span className="text-sm opacity-90">{card.description}</span>
          </div>
        );

      case "activity":
        return (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-medium text-base mb-2">{card.title}</span>
            <div className="space-y-3">
              {card.activities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    activity.type === "success" && "bg-emerald-50 text-emerald-700",
                    activity.type === "warning" && "bg-amber-50 text-amber-700",
                    activity.type === "info" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-xs opacity-75 mt-1">{activity.description}</div>
                  <div className="text-xs mt-2 opacity-60">{activity.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "chart":
        // Implementação futura para gráficos
        return (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-medium text-base mb-2">{card.title}</span>
            <div className="text-sm opacity-90">{card.description}</div>
            {/* Aqui será implementado o componente de gráfico */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative h-full rounded-xl shadow-md p-6 bg-gradient-to-br",
        card.gradient,
        "text-white overflow-hidden transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      {/* Ícone no canto superior direito */}
      <div className="absolute top-4 right-4">
        <div className={cn("rounded-lg p-2", card.iconBg, "flex items-center justify-center")}>
          <Icon className={cn("w-6 h-6", card.iconColor)} />
        </div>
      </div>

      {/* Conteúdo do card */}
      {renderCardContent()}
    </div>
  );
} 