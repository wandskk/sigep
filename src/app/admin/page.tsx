"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      // Redireciona usuários não-admin para o dashboard
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">
              Painel Administrativo
            </h1>            
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card de Usuários */}
            <Link href="/admin/usuarios">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">Usuários</h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar usuários do sistema
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Usuários &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Escolas */}
            <Link href="/admin/escolas">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">Escolas</h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar escolas e unidades
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Escolas &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Configurações */}
            <Link href="/admin/configuracoes">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">Configurações</h3>
                  <p className="mt-1 text-[#374151]/70">
                    Configurações do sistema
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Configurações &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Logs */}
            <Link href="/admin/logs">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">Logs do Sistema</h3>
                  <p className="mt-1 text-[#374151]/70">
                    Visualizar logs e atividades
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Ver Logs &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Backup */}
            <Link href="/admin/backup">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">Backup</h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar backups do sistema
                  </p>
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Backup &rarr;
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 