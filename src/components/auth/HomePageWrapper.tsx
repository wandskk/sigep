"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export function HomePageWrapper() {
  const { status } = useSession();
  const { isAuthenticated, isFirstLogin, user, isLoading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    // Se estiver carregando, não fazer nada ainda
    if (status === "loading" || isLoading) {
      return;
    }

    // Se estiver autenticado, redirecionar para dashboard apropriado
    if (isAuthenticated && user) {
      // Se for primeiro login, redirecionar para trocar senha
      if (isFirstLogin) {
        router.push("/trocar-senha");
        return;
      }

      // Caso contrário, redirecionar para o dashboard apropriado
      const redirectUrl = getRedirectUrl(user.role);
      router.push(redirectUrl);
      return;
    }

    // Se não estiver autenticado, redirecionar para login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthenticated, isFirstLogin, user, router, isLoading]);

  // Mostrar loading enquanto verifica autenticação e redireciona
  return <LoadingSpinner message="Redirecionando..." />;
} 