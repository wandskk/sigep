import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Responsavel } from "./components/Responsavel";
import { EdicaoAluno } from "./components/EdicaoAluno";
import { OcorrenciasClient } from "./components/OcorrenciasClient";
import { UserRole, TipoOcorrencia } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Aluno - Admin",
  description: "Página de edição de aluno para administradores",
};

interface PageProps {
  params: {
    id: string;
  };
}

async function getResumoOcorrencias(alunoId: string) {
  const tipos = [
    TipoOcorrencia.ADVERTENCIA,
    TipoOcorrencia.ELOGIO,
    TipoOcorrencia.COMUNICADO,
    TipoOcorrencia.OUTRO,
  ];

  const counts = await Promise.all(
    tipos.map(async (tipo) => ({
      tipo,
      count: await prisma.ocorrencia.count({
        where: { alunoId, tipo },
      }),
    }))
  );

  return counts;
}

async function getOcorrenciasIniciais(alunoId: string) {
  const ocorrencias = await prisma.ocorrencia.findMany({
    where: { alunoId },
    include: {
      autor: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      dataOcorrencia: 'desc'
    }
  });

  return ocorrencias;
}

export default async function AlunoDetailsPage({ params }: PageProps) {
  const { id } = params;
  let aluno;
  let error: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  try {
    // Busca o aluno com todas as suas relações (admin pode ver qualquer aluno)
    aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        user: true,
        turmas: {
          include: {
            turma: {
              include: {
                escola: true
              }
            }
          }
        }
      }
    });

    if (!aluno) {
      throw new Error("Aluno não encontrado");
    }

    const [resumoOcorrencias, ocorrenciasIniciais] = await Promise.all([
      getResumoOcorrencias(id),
      getOcorrenciasIniciais(id)
    ]);

    const getTagStyle = (tipo: string) => {
      switch (tipo.toUpperCase()) {
        case "ADVERTENCIA":
          return "bg-red-100 text-red-700 border-red-200";
        case "ELOGIO":
          return "bg-green-100 text-green-700 border-green-200";
        case "COMUNICADO":
          return "bg-blue-100 text-blue-700 border-blue-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    };

    const getCardStyle = (tipo: string) => {
      switch (tipo.toUpperCase()) {
        case "ADVERTENCIA":
          return "border-red-200 hover:border-red-300";
        case "ELOGIO":
          return "border-green-200 hover:border-green-300";
        case "COMUNICADO":
          return "border-blue-200 hover:border-blue-300";
        default:
          return "border-gray-200 hover:border-gray-300";
      }
    };

    const getTextStyle = (tipo: string) => {
      switch (tipo.toUpperCase()) {
        case "ADVERTENCIA":
          return "text-red-700";
        case "ELOGIO":
          return "text-green-700";
        case "COMUNICADO":
          return "text-blue-700";
        default:
          return "text-gray-700";
      }
    };

    const getSecondaryTextStyle = (tipo: string) => {
      switch (tipo.toUpperCase()) {
        case "ADVERTENCIA":
          return "text-red-500";
        case "ELOGIO":
          return "text-green-500";
        case "COMUNICADO":
          return "text-blue-500";
        default:
          return "text-gray-500";
      }
    };

    if (error || !aluno) {
      return (
        <div className="min-h-screen bg-[#F3F4F6]">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Alert variant="error" className="mb-6">
                {error || "Não foi possível carregar os dados do aluno"}
              </Alert>
              <Link href="/admin/alunos">
                <Button
                  variant="outline"
                  className="group flex items-center gap-2 mb-4 bg-white/50 backdrop-blur-sm border-blue-900/20 text-blue-900 hover:bg-blue-50 hover:border-blue-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Voltar para Lista de Alunos</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <Link href="/admin/alunos">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Lista de Alunos
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-[#374151]">
                  {aluno.user.name}
                </h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Matrícula: {aluno.matricula}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {resumoOcorrencias.map(({ tipo, count }) => (
                <div
                  key={tipo}
                  className={`relative bg-white rounded-lg border-2 p-4 flex flex-col items-center transition-all duration-200 hover:shadow-md ${getCardStyle(tipo)}`}
                >
                  <div className={`absolute -right-2 -top-2 px-2 py-1 rounded-full text-xs font-medium border ${getTagStyle(tipo)}`}>
                    {tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                  </div>
                  <span className={`text-2xl font-bold mt-2 ${getTextStyle(tipo)}`}>{count}</span>
                  <div className={`mt-1 text-xs ${getSecondaryTextStyle(tipo)}`}>
                    {count === 1 ? 'ocorrência' : 'ocorrências'}
                  </div>
                </div>
              ))}
            </div>

            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="dados">
                  <EdicaoAluno aluno={aluno} />
                </TabsContent>

                <TabsContent value="responsavel">
                  <Responsavel alunoId={aluno.id} />
                </TabsContent>

                <TabsContent value="ocorrencias">
                  <OcorrenciasClient 
                    alunoId={aluno.id} 
                    ocorrenciasIniciais={ocorrenciasIniciais} 
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    redirect("/admin/alunos");
  }
} 