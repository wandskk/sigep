"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/schemas/auth.schema";
import { LoginFormValues } from "@/lib/types/schema.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Label } from "@/components/ui/Label";
import { UserRole } from "@prisma/client";

const usuariosBase = [
  {
    email: "admin@sigep.com",
    senha: "senha123",
    nome: "Administrador",
    role: UserRole.ADMIN,
  },
  {
    email: "secretaria@sigep.com",
    senha: "senha123",
    nome: "Secretaria",
    role: UserRole.SECRETARIA,
  },
  {
    email: "gestor@sigep.com",
    senha: "senha123",
    nome: "Gestor",
    role: UserRole.GESTOR,
  },
  {
    email: "professor@sigep.com",
    senha: "senha123",
    nome: "Professor",
    role: UserRole.PROFESSOR,
  },
];

// Função auxiliar para verificar sessão e primeiro login com retry
async function checkSessionAndFirstLogin(maxAttempts = 3) {
  let session = null;
  let isFirstLogin = false;
  
  // Aguardar um pouco para garantir que a sessão seja atualizada
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Tentar múltiplas vezes para garantir que a sessão seja obtida
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const userResponse = await fetch("/api/auth/session", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (userResponse.ok) {
        session = await userResponse.json();
        if (session?.user) {
          break;
        }
      }
    } catch (error) {
      console.error(`[LOGIN] Tentativa ${attempt + 1} de obter sessão falhou:`, error);
    }
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!session?.user) {
    throw new Error("Não foi possível obter informações da sessão após múltiplas tentativas");
  }

  // Verificar se é o primeiro login com retry
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const firstLoginResponse = await fetch("/api/auth/check-first-login", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (firstLoginResponse.ok) {
        const firstLoginData = await firstLoginResponse.json();
        isFirstLogin = firstLoginData.firstLogin;
        break;
      }
    } catch (error) {
      console.error(`[LOGIN] Tentativa ${attempt + 1} de verificar primeiro login falhou:`, error);
    }
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { session, isFirstLogin };
}

// Função para determinar URL de redirecionamento baseada no role
function getRedirectUrl(userRole: string, callbackUrl: string = "/dashboard"): string {
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
      return callbackUrl;
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciais inválidas. Verifique seu email e senha.");
        return;
      }

      // Verificar sessão e primeiro login
      const { session, isFirstLogin } = await checkSessionAndFirstLogin();

      // Se for o primeiro login, redirecionar para trocar senha
      if (isFirstLogin) {
        router.push("/trocar-senha");
        return;
      }

      // Determinar para onde redirecionar com base no papel do usuário
      const redirectUrl = getRedirectUrl(session.user.role, callbackUrl);

      // Redirecionar para a URL adequada
      router.push(redirectUrl);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("[LOGIN] Erro ao fazer login:", error);
      setError("Ocorreu um erro ao fazer login. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRapido = async (email: string, senha: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (result?.error) {
        setError("Erro ao fazer login rápido");
        return;
      }

      // Verificar sessão e primeiro login
      const { session, isFirstLogin } = await checkSessionAndFirstLogin();

      // Se for o primeiro login, redirecionar para trocar senha
      if (isFirstLogin) {
        router.push("/trocar-senha");
        return;
      }

      // Determinar para onde redirecionar com base no papel do usuário
      const redirectUrl = getRedirectUrl(session.user.role);

      router.push(redirectUrl);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("[LOGIN_RAPIDO] Erro:", error);
      setError("Ocorreu um erro ao fazer login rápido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 px-4 sm:px-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#3151A6] bg-clip-text text-transparent animate-fade-in">
          SIGEP
        </h1>
        <p className="text-base text-gray-600 animate-fade-in-delay">
          Sistema Integrado de Gestão Escolar
        </p>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  error={errors.email?.message}
                  disabled={isLoading}
                  className="h-12 pl-11 transition-all duration-200 focus:ring-2 focus:ring-[#1E3A8A]/20"
                  leftIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  }
                  {...register("email")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="h-12 pl-11 transition-all duration-200 focus:ring-2 focus:ring-[#1E3A8A]/20"
                  leftIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  {...register("password")}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] transition-colors duration-200"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors duration-200"
                >
                  Lembrar de mim
                </label>
              </div>

              <Link
                href="/esqueci-senha"
                className="text-sm text-[#1E3A8A] hover:text-[#15286D] hover:underline font-medium transition-colors duration-200"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {error && (
              <Alert 
                variant="error" 
                className="animate-shake"
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="h-12 text-base font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Login Rápido */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Login Rápido
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {usuariosBase.map((usuario) => (
                <Button
                  key={usuario.email}
                  variant="outline"
                  onClick={() => handleLoginRapido(usuario.email, usuario.senha)}
                  disabled={isLoading}
                  className="text-sm h-10 transition-all duration-200 hover:bg-gray-50"
                >
                  {usuario.nome}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
