"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Exibir carregamento enquanto verifica a sessão
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Carregando...</h2>
          <p className="text-gray-600">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard SIGEP</h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo, {session?.user?.name || "Usuário"}!
          </p>
        </header>

        <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Cartões de acesso rápido */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Meu Perfil</h3>
              <p className="mt-1 text-gray-600">
                Visualize e edite suas informações pessoais
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Acessar &rarr;
              </button>
            </div>
          </div>

          {/* Exemplo de componente condicional baseado no papel do usuário */}
          {session?.user?.role === "PROFESSOR" && (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Minhas Turmas</h3>
                <p className="mt-1 text-gray-600">
                  Gerenciar suas turmas e lançar notas
                </p>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Acessar &rarr;
                </button>
              </div>
            </div>
          )}

          {session?.user?.role === "ALUNO" && (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Minhas Notas</h3>
                <p className="mt-1 text-gray-600">
                  Visualizar seu desempenho acadêmico
                </p>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Acessar &rarr;
                </button>
              </div>
            </div>
          )}

          {(session?.user?.role === "GESTOR" || session?.user?.role === "SECRETARIA" || session?.user?.role === "ADMIN") && (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Administração</h3>
                <p className="mt-1 text-gray-600">
                  Gerenciar usuários e configurações
                </p>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Acessar &rarr;
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 