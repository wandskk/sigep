"use client";

import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
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

export function ForgotPasswordPageWrapper() {
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

  // Se não estiver autenticado, mostrar o formulário de recuperação de senha
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado esquerdo - Background decorativo */}
      <div className="hidden md:flex md:w-1/2 bg-[#1E3A8A] relative">
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
        <div className="z-10 flex items-center justify-center w-full h-full">
          <div className="text-center text-white p-8">
            <h1 className="text-5xl font-bold mb-4">SIGEP</h1>
            <p className="text-xl font-light mb-6">
              Sistema de Gestão Escolar Pública de Baraúna
            </p>
            <div className="w-20 h-1 bg-[#10B981] mx-auto"></div>
            <p className="mt-8 text-white/80 max-w-md mx-auto">
              Plataforma unificada para gestão acadêmica, administrativa e
              pedagógica das escolas municipais.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de recuperação de senha */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F3F4F6] p-6">
        <Suspense fallback={<LoadingSpinner message="Carregando formulário..." size="sm" className="min-h-0" />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
} 