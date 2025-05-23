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

      // Buscar informações atualizadas do usuário
      const userResponse = await fetch("/api/auth/session");
      const session = await userResponse.json();

      // Determinar para onde redirecionar com base no papel do usuário
      let redirectUrl = callbackUrl;

      if (session?.user?.role) {
        switch (session.user.role) {
          case "ADMIN":
            redirectUrl = "/admin";
            break;
          case "SECRETARIA":
            redirectUrl = "/secretaria";
            break;
          case "GESTOR":
            redirectUrl = "/gestor";
            break;
          case "PROFESSOR":
            redirectUrl = "/professor";
            break;
          case "ALUNO":
            redirectUrl = "/aluno";
            break;
          default:
            redirectUrl = "/dashboard";
        }
      }

      // Redirecionar para a URL adequada
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
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

      // Buscar informações atualizadas do usuário
      const userResponse = await fetch("/api/auth/session");
      const session = await userResponse.json();

      // Determinar para onde redirecionar com base no papel do usuário
      let redirectUrl = "/dashboard";

      if (session?.user?.role) {
        switch (session.user.role) {
          case "ADMIN":
            redirectUrl = "/admin";
            break;
          case "SECRETARIA":
            redirectUrl = "/secretaria";
            break;
          case "GESTOR":
            redirectUrl = "/gestor";
            break;
          case "PROFESSOR":
            redirectUrl = "/professor";
            break;
          case "ALUNO":
            redirectUrl = "/aluno";
            break;
          default:
            redirectUrl = "/dashboard";
        }
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      setError("Ocorreu um erro ao fazer login rápido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#3151A6] bg-clip-text text-transparent">
          SIGEP
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sistema Integrado de Gestão Escolar
        </p>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                error={errors.email?.message}
                disabled={isLoading}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                }
                {...register("email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={isLoading}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded text-[#1E3A8A] border-gray-300 focus:ring-[#1E3A8A]"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-[#374151]"
                >
                  Lembrar de mim
                </label>
              </div>

              <Link
                href="/esqueci-senha"
                className="text-sm text-[#1E3A8A] hover:text-[#15286D] hover:underline font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Login Rápido - Apenas para desenvolvimento */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Login Rápido (Desenvolvimento)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {usuariosBase.map((usuario) => (
                  <Button
                    key={usuario.email}
                    variant="outline"
                    onClick={() =>
                      handleLoginRapido(usuario.email, usuario.senha)
                    }
                    disabled={isLoading}
                    className="text-sm"
                  >
                    {usuario.nome}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
