"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

// Esquema de validação do formulário
const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof formSchema>;

export default function RecuperarSenhaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular envio de e-mail de recuperação
      // Em produção, isso chamaria uma API real
      console.log("Enviando e-mail de recuperação para:", data.email);
      
      // Simular um atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setEmailSent(true);
    } catch (error) {
      setError("Ocorreu um erro ao enviar o e-mail. Tente novamente.");
      console.error("Erro ao enviar e-mail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              E-mail enviado
            </h1>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Se o e-mail estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Verifique sua caixa de entrada e a pasta de spam.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/entrar"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recuperar senha
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Informe seu e-mail para receber o link de recuperação
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/entrar"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
} 