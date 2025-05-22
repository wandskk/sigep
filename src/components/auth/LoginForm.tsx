"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/schemas/auth.schema";
import { LoginFormValues } from "@/lib/types/schema.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);

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

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      // Aqui seria implementada a lógica de autenticação
      console.log("Dados do formulário:", data);

      // Simula um atraso de 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="default">
      <div className="flex flex-col items-center mb-6 mt-2">
        <h1 className="text-2xl font-bold text-[#374151] mb-6 mt-4">
          Entrar no SIGEP
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          <Input
            label="Email"
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

          <Input
            label="Senha"
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            Entrar
          </Button>
        </form>
      </div>
    </Card>
  );
}
