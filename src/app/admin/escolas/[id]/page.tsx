"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

const editSchoolSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  gestorId: z.string().optional().nullable(),
});

type EditSchoolFormData = z.infer<typeof editSchoolSchema>;

type School = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string | null;
  gestorId: string | null;
  gestor?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
};

type Gestor = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("id") || params?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [query, setQuery] = useState("");
  const [selectedGestor, setSelectedGestor] = useState<Gestor | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditSchoolFormData>({
    resolver: zodResolver(editSchoolSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== UserRole.ADMIN
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [schoolRes, gestoresRes] = await Promise.all([
          fetch(`/api/admin/schools/${schoolId}`),
          fetch("/api/admin/gestores"),
        ]);

        if (!schoolRes.ok) {
          if (schoolRes.status === 404) {
            router.push("/admin/escolas");
            return;
          }
          throw new Error("Erro ao carregar escola");
        }

        if (!gestoresRes.ok) {
          throw new Error("Erro ao carregar gestores");
        }

        const [schoolData, gestoresData] = await Promise.all([
          schoolRes.json(),
          gestoresRes.json(),
        ]);

        setSchool(schoolData);
        setGestores(gestoresData);
        reset(schoolData);
      } catch (err) {
        setError("Não foi possível carregar os dados");
        console.error("Erro ao buscar dados:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user?.role === UserRole.ADMIN) {
      fetchData();
    }
  }, [session, schoolId, router, reset]);

  // Filtrar gestores baseado na busca
  const filteredGestores = useMemo(() => {
    if (!query) return gestores;
    const searchTerm = query.toLowerCase();
    return gestores.filter(
      (gestor) =>
        gestor.user.name.toLowerCase().includes(searchTerm) ||
        gestor.user.email.toLowerCase().includes(searchTerm)
    );
  }, [gestores, query]);

  // Atualizar gestor selecionado quando os dados da escola são carregados
  useEffect(() => {
    if (school?.gestor) {
      setSelectedGestor(school.gestor);
    }
  }, [school]);

  // Atualizar o valor do campo gestorId quando um gestor é selecionado ou removido
  useEffect(() => {
    if (school) {
      const formData: Partial<EditSchoolFormData> = {
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        phone: school.phone,
        email: school.email,
        website: school.website || "",
        gestorId: selectedGestor?.id || null,
      };
      reset(formData);
    }
  }, [selectedGestor, school, reset]);

  const handleRemoveGestor = () => {
    setSelectedGestor(null);
    reset({
      ...school,
      gestorId: null,
      website: school?.website || "",
    });
  };

  const onSubmit = async (data: EditSchoolFormData) => {
    try {
      setIsSubmitting(true);
      setSuccess(null);
      setError(null);

      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar escola");
      }

      const updatedSchool = await response.json();
      setSchool(updatedSchool);
      setSuccess("Escola atualizada com sucesso!");

      // Redireciona para a página de escolas após 1 segundo
      setTimeout(() => {
        router.push("/admin/escolas");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar escola");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error">Escola não encontrada</Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">Editar Escola</h1>
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

          {success && (
            <Alert variant="success" className="mb-6">
              {success}
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

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gestor Responsável
                  </label>
                  <Combobox value={selectedGestor} onChange={setSelectedGestor}>
                    <div className="relative">
                      <Combobox.Input
                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] sm:text-sm"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => setQuery(event.target.value)}
                        displayValue={(gestor: Gestor | null) =>
                          gestor?.user.name || ""
                        }
                        placeholder="Buscar gestor por nome ou email..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>

                      {filteredGestores.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredGestores.map((gestor) => (
                            <Combobox.Option
                              key={gestor.id}
                              value={gestor}
                              className={({ active }: { active: boolean }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active
                                    ? "bg-[#1E3A8A] text-white"
                                    : "text-gray-900"
                                }`
                              }
                            >
                              {({
                                selected,
                                active,
                              }: {
                                selected: boolean;
                                active: boolean;
                              }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-semibold" : "font-normal"
                                    }`}
                                  >
                                    {gestor.user.name}
                                  </span>
                                  <span
                                    className={`block truncate text-sm ${
                                      active ? "text-white" : "text-gray-500"
                                    }`}
                                  >
                                    {gestor.user.email}
                                  </span>
                                  {selected && (
                                    <span
                                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                        active ? "text-white" : "text-[#1E3A8A]"
                                      }`}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                  <button
                    type="button"
                    onClick={handleRemoveGestor}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remover gestor
                  </button>
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
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
