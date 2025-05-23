"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole, Turno } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Clock,
  Plus,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Loader } from "@/components/ui/Loader";

interface Turma {
  id: string;
  nome: string;
  turno: string;
  _count: {
    alunos: number;
    professores: number;
    disciplinas: number;
  };
}

interface DashboardStats {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  totalDisciplinas: number;
}

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome da turma é obrigatório"),
  turno: z.nativeEnum(Turno, {
    required_error: "Turno é obrigatório",
  }),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

interface DashboardContentProps {
  turmasIniciais: Turma[];
  statsIniciais: DashboardStats;
}

export function DashboardContent({ turmasIniciais, statsIniciais }: DashboardContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [turmas, setTurmas] = useState<Turma[]>(turmasIniciais);
  const [stats, setStats] = useState<DashboardStats>(statsIniciais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnoFiltro, setTurnoFiltro] = useState<Turno | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
  });

  const onSubmit = async (data: TurmaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/gestor/turmas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao criar turma");
      }

      const novaTurma = await response.json();
      setSuccess("Turma criada com sucesso!");
      setIsModalOpen(false);
      reset();
      setTurmas(prev => [...prev, novaTurma]);
      setStats(prev => ({
        ...prev,
        totalTurmas: prev.totalTurmas + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar turma");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader 
          size="lg" 
          variant="primary" 
          text="Carregando dashboard..." 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard do Gestor
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao painel de controle da sua escola
          </p>
        </div>
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

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => handleNavigation("/gestor/alunos")}
          className="block group cursor-pointer relative w-full text-left"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">
                Total de Alunos
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalAlunos}
              </div>
              <p className="text-sm text-white/80">Matriculados atualmente</p>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => handleNavigation("/gestor/professores")}
          className="block group cursor-pointer relative w-full text-left"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">
                Professores
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalProfessores}
              </div>
              <p className="text-sm text-white/80">Corpo docente ativo</p>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => handleNavigation("/gestor/turmas")}
          className="block group cursor-pointer relative w-full text-left"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">
                Turmas
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalTurmas}
              </div>
              <p className="text-sm text-white/80">Em funcionamento</p>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => handleNavigation("/gestor/disciplinas")}
          className="block group cursor-pointer relative w-full text-left"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-white/90">
                Disciplinas
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalDisciplinas}
              </div>
              <p className="text-sm text-white/80">Total de disciplinas</p>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Lista de Turmas */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="border-b border-gray-100/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              Turmas da Escola
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  variant={!turnoFiltro ? "primary" : "secondary"}
                  className={
                    !turnoFiltro
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      : ""
                  }
                  onClick={() => setTurnoFiltro(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={
                    turnoFiltro === Turno.MATUTINO ? "primary" : "secondary"
                  }
                  className={
                    turnoFiltro === Turno.MATUTINO
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      : ""
                  }
                  onClick={() => setTurnoFiltro(Turno.MATUTINO)}
                >
                  Matutino
                </Button>
                <Button
                  variant={
                    turnoFiltro === Turno.VESPERTINO ? "primary" : "secondary"
                  }
                  className={
                    turnoFiltro === Turno.VESPERTINO
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      : ""
                  }
                  onClick={() => setTurnoFiltro(Turno.VESPERTINO)}
                >
                  Vespertino
                </Button>
                <Button
                  variant={
                    turnoFiltro === Turno.NOTURNO ? "primary" : "secondary"
                  }
                  className={
                    turnoFiltro === Turno.NOTURNO
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                      : ""
                  }
                  onClick={() => setTurnoFiltro(Turno.NOTURNO)}
                >
                  Noturno
                </Button>
              </div>
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => {
                  reset();
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nova Turma
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {turmas
              .filter((turma) => !turnoFiltro || turma.turno === turnoFiltro)
              .map((turma) => (
                <button
                  key={turma.id}
                  onClick={() => handleNavigation(`/gestor/turmas/${turma.id}`)}
                  className="block group cursor-pointer relative w-full text-left"
                >
                  <div className="h-full bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all duration-300 shadow-sm hover:shadow-md p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            turma.turno === Turno.MATUTINO
                              ? "bg-amber-100 text-amber-800 group-hover:bg-amber-200"
                              : turma.turno === Turno.VESPERTINO
                              ? "bg-orange-100 text-orange-800 group-hover:bg-orange-200"
                              : "bg-blue-100 text-blue-800 group-hover:bg-blue-200"
                          } transition-colors`}
                        >
                          {turma.turno === Turno.MATUTINO
                            ? "Matutino"
                            : turma.turno === Turno.VESPERTINO
                            ? "Vespertino"
                            : "Noturno"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-3">
                        {turma.nome}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-blue-600" />
                              {turma._count.alunos}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-emerald-600" />
                              {turma._count.professores}
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 text-blue-600 group-hover:text-blue-800">
                            Gerenciar
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nova Turma */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
              Nova Turma
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Nome da Turma
                </label>
                <Input
                  error={errors.nome?.message}
                  {...register("nome")}
                  placeholder="Digite o nome da turma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Turno
                </label>
                <Select
                  value={watch("turno")}
                  onValueChange={(value: Turno) => setValue("turno", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Turno.MATUTINO}>Matutino</SelectItem>
                    <SelectItem value={Turno.VESPERTINO}>Vespertino</SelectItem>
                    <SelectItem value={Turno.NOTURNO}>Noturno</SelectItem>
                  </SelectContent>
                </Select>
                {errors.turno?.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.turno.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Turma"}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 