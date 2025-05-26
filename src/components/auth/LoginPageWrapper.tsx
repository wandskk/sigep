"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuthState } from "@/hooks/useAuthState";

// Função para determinar URL de redirecionamento baseada no role
function getRedirectUrl(userRole: string): string {
  switch (userRole) {
    case "ADMIN":
      return "/admin";
    case "SECRETARIA":
      return "/secretaria";
    case "GESTOR":
      return "/gestor";
    case "PROFESSOR":
      return "/professor";
    case "ALUNO":
      return "/aluno";
    default:
      return "/dashboard";
  }
}

export function LoginPageWrapper() {
  const { status } = useSession();
  const { isAuthenticated, isFirstLogin, user, isLoading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    // Se estiver carregando, não fazer nada ainda
    if (status === "loading" || isLoading) {
      return;
    }

    // Se estiver autenticado, redirecionar
    if (isAuthenticated && user) {
      // Se for primeiro login, redirecionar para trocar senha
      if (isFirstLogin) {
        router.push("/trocar-senha");
        return;
      }

      // Caso contrário, redirecionar para o dashboard apropriado
      const redirectUrl = getRedirectUrl(user.role);
      router.push(redirectUrl);
    }
  }, [status, isAuthenticated, isFirstLogin, user, router, isLoading]);

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading" || isLoading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Se estiver autenticado, mostrar loading enquanto redireciona
  if (isAuthenticated) {
    return <LoadingSpinner message="Redirecionando..." />;
  }

  // Se não estiver autenticado, mostrar o formulário de login
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Lado esquerdo - Background decorativo */}
      <div className="hidden md:flex md:w-1/2 bg-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="dots"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/90 to-[#3151A6]/90" />
        <div className="z-10 flex items-center justify-center w-full h-full">
          <div className="text-center text-white p-8 max-w-lg">
            <h1 className="text-5xl font-bold mb-4 animate-fade-in">SIGEP</h1>
            <p className="text-xl font-light mb-6 animate-fade-in-delay">
              Sistema Integrado de Gestão Escolar de Baraúna/RN
            </p>
            <div className="w-20 h-1 bg-[#10B981] mx-auto animate-slide-up"></div>
            <p className="mt-8 text-white/90 max-w-md mx-auto animate-fade-in-delay">
              Plataforma unificada para gestão acadêmica, administrativa e
              pedagógica das escolas municipais.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 