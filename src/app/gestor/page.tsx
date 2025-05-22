"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

interface Escola {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  website: string | null;
  _count: {
    turmas: number;
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

export default function GestorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escola, setEscola] = useState<Escola | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "GESTOR") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "GESTOR") {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [escolaRes, statsRes] = await Promise.all([
        fetch("/api/gestor/escola"),
        fetch("/api/gestor/stats"),
      ]);

      if (!escolaRes.ok || !statsRes.ok) {
        throw new Error("Erro ao carregar dados do dashboard");
      }

      const [escolaData, statsData] = await Promise.all([
        escolaRes.json(),
        statsRes.json(),
      ]);

      setEscola(escolaData);
      setStats(statsData);
    } catch (err) {
      setError("Erro ao carregar dados do dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "GESTOR") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">
              Painel do Gestor
            </h1>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {escola && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#374151] mb-4">
                Informações da Escola
              </h2>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[#374151]">
                    {escola.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#6B7280]">
                    {escola.address}, {escola.city} - {escola.state}
                  </p>
                  <div className="mt-2 text-sm text-[#6B7280]">
                    <p>Email: {escola.email}</p>
                    <p>Telefone: {escola.phone}</p>
                    {escola.website && <p>Website: {escola.website}</p>}
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card de Alunos */}
            <Link href="/gestor/alunos">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">
                    Alunos
                  </h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar alunos da escola
                  </p>
                  {stats && (
                    <p className="mt-2 text-2xl font-semibold text-[#1E3A8A]">
                      {stats.totalAlunos} alunos
                    </p>
                  )}
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Alunos &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Professores */}
            <Link href="/gestor/professores">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">
                    Professores
                  </h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar professores da escola
                  </p>
                  {stats && (
                    <p className="mt-2 text-2xl font-semibold text-[#1E3A8A]">
                      {stats.totalProfessores} professores
                    </p>
                  )}
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Professores &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Turmas */}
            <Link href="/gestor/turmas">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">
                    Turmas
                  </h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar turmas da escola
                  </p>
                  {stats && (
                    <p className="mt-2 text-2xl font-semibold text-[#1E3A8A]">
                      {stats.totalTurmas} turmas
                    </p>
                  )}
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Turmas &rarr;
                  </span>
                </div>
              </Card>
            </Link>

            {/* Card de Disciplinas */}
            <Link href="/gestor/disciplinas">
              <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#1E3A8A]">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#374151]">
                    Disciplinas
                  </h3>
                  <p className="mt-1 text-[#374151]/70">
                    Gerenciar disciplinas da escola
                  </p>
                  {stats && (
                    <p className="mt-2 text-2xl font-semibold text-[#1E3A8A]">
                      {stats.totalDisciplinas} disciplinas
                    </p>
                  )}
                </div>
                <div className="bg-[#F3F4F6] px-5 py-3">
                  <span className="text-sm font-medium text-[#1E3A8A] hover:text-[#15286D]">
                    Gerenciar Disciplinas &rarr;
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
