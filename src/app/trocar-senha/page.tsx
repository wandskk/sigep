"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuthState } from "@/hooks/useAuthState";

const senhaSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SenhaFormData = z.infer<typeof senhaSchema>;

export default function TrocarSenhaPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <TrocarSenhaPage />
    </Suspense>
  );
}

function TrocarSenhaPage() {
  const { data: session, status, update } = useSession();
  const { isAuthenticated, isFirstLogin, refreshAuthState } = useAuthState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
  });

  useEffect(() => {
    // Redireciona para o login se não estiver autenticado
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Se estiver autenticado, verificar o status do primeiro login
    if (status === "authenticated" && isFirstLogin !== null) {
      if (!isFirstLogin) {
        redirectToDashboard();
        return;
      } else {
        setIsLoading(false);
      }
    }
  }, [status, isFirstLogin, router]);



  const redirectToDashboard = () => {
    if (!session) return;
    
    switch (session.user.role) {
      case "PROFESSOR":
        router.push("/professor");
        break;
      case "SECRETARIA":
        router.push("/secretaria");
        break;
      case "GESTOR":
        router.push("/gestor");
        break;
      case "ALUNO":
        router.push("/aluno");
        break;
      default:
        router.push("/dashboard");
    }
  };

  const onSubmit = async (data: SenhaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao alterar senha");
      }

      setSuccess("Senha alterada com sucesso! Redirecionando...");
      
      // Atualizar o estado de autenticação
      await refreshAuthState();
      
      // Aguardar um pouco para garantir que a atualização seja processada
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirecionar
      redirectToDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner message="Verificando status de autenticação..." />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Troque sua senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Por questões de segurança, você precisa alterar sua senha no primeiro acesso.
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual (temporária)
              </label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirme a Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 