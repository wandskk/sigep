"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Loading para cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card
            key={index}
            className="h-32 bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-lg overflow-hidden"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading para métricas e atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[400px] bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-6 bg-gray-100/50 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gray-200" />
                      <div className="h-5 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="text-center">
                          <div className="h-3 w-16 bg-gray-200 rounded mb-2 mx-auto" />
                          <div className="h-6 w-12 bg-gray-200 rounded mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-[400px] bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-lg bg-gray-50/80"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-2 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function MetricsLoading() {
  return (
    <Card className="h-full">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-5 w-48 rounded bg-gray-200" />
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-full rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded bg-white/20" />
                  <div className="h-5 w-32 rounded bg-white/20" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="text-center">
                      <div className="h-3 w-16 mx-auto rounded bg-white/20" />
                      <div className="h-6 w-12 mx-auto mt-2 rounded bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Distribuições */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="animate-pulse">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="h-3 w-16 mx-auto rounded bg-gray-200" />
                      <div className="h-6 w-12 mx-auto mt-2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ActivityLoading() {
  return (
    <Card className="h-full">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-5 w-48 rounded bg-gray-200" />
        </div>

        {/* Lista de Atividades */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3 p-3">
                <div className="h-5 w-5 rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 