"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

const createSchoolSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório").max(2, "Estado deve ter 2 caracteres"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;

export default function NewSchoolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSchoolFormData>({
    resolver: zodResolver(createSchoolSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const onSubmit = async (data: CreateSchoolFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar escola");
      }

      router.push("/admin/escolas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar escola");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">
              Nova Escola
            </h1>
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/escolas")}
            >
              Cancelar
            </Button>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Nome da Escola"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Endereço"
                    error={errors.address?.message}
                    {...register("address")}
                  />
                </div>

                <div>
                  <Input
                    label="Cidade"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                </div>

                <div>
                  <Input
                    label="Estado"
                    error={errors.state?.message}
                    placeholder="UF"
                    maxLength={2}
                    {...register("state")}
                  />
                </div>

                <div>
                  <Input
                    label="Telefone"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                <div>
                  <Input
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Website (opcional)"
                    type="url"
                    error={errors.website?.message}
                    {...register("website")}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin/escolas")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Criando..." : "Criar Escola"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 