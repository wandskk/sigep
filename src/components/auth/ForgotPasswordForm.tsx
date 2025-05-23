"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validators/schemas/auth.schema";
import { ForgotPasswordFormValues } from "@/lib/types/schema.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Simula um atraso de 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Marca como enviado após o processamento
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exibe mensagem de sucesso após o envio
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto" variant="default">
        <div className="flex flex-col items-center mb-6 mt-2">
          <h1 className="text-2xl font-bold text-[#374151] mb-6 mt-4">
            Email Enviado
          </h1>
          
          <div className="text-center space-y-4 w-full px-4">
            <p className="text-[#374151]">
              Se o email informado estiver cadastrado em nosso sistema, enviaremos 
              instruções para redefinir sua senha.
            </p>
            
            <p className="text-[#374151]">
              Por favor, verifique sua caixa de entrada e a pasta de spam.
            </p>
            
            <div className="pt-4 mt-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  fullWidth
                >
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="default">
      <div className="flex flex-col items-center mb-6 mt-2">
        <h1 className="text-2xl font-bold text-[#374151] mb-6 mt-4">
          Recuperar Senha
        </h1>
        
        <p className="text-center text-[#374151]/80 mb-6 px-4">
          Informe seu email cadastrado para receber um link de recuperação de senha.
        </p>
        
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
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            Enviar Link de Recuperação
          </Button>
          
          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-[#1E3A8A] hover:text-[#15286D] hover:underline font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </Card>
  );
} 