import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TipoOcorrencia } from "@prisma/client";
import { Search, AlertCircle, ThumbsUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatarData } from "@/lib/utils/formatadores";

interface PageProps {
  searchParams: {
    tipo?: string;
    busca?: string;
  };
}

async function getOcorrencias(professorId: string, tipo?: string, busca?: string) {
  // Primeiro, busca o professor para obter o userId
  const professor = await prisma.professor.findUnique({
    where: { id: professorId },
    select: { userId: true }
  });

  if (!professor) {
    return [];
  }

  const where = {
    autorId: professor.userId, // Usa o userId do professor
    ...(tipo && tipo !== "TODOS" && { tipo: tipo as TipoOcorrencia }),
    ...(busca && {
      OR: [
        { titulo: { contains: busca, mode: 'insensitive' as const } },
        { descricao: { contains: busca, mode: 'insensitive' as const } },
        { aluno: { user: { name: { contains: busca, mode: 'insensitive' as const } } } }
      ]
    })
  };

  const ocorrencias = await prisma.ocorrencia.findMany({
    where,
    include: {
      aluno: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: [
      { dataOcorrencia: 'desc' },
      { dataRegistro: 'desc' }
    ],
    take: 50
  });

  return ocorrencias;
}

interface OcorrenciaComAluno {
  id: string;
  tipo: TipoOcorrencia;
  titulo: string;
  descricao: string;
  dataOcorrencia: Date;
  dataRegistro: Date;
  alunoId: string;
  aluno: {
    user: {
      name: string;
    };
  };
}

export default async function OcorrenciasPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PROFESSOR") {
    redirect("/login");
  }

  // Busca o professor
  const professor = await prisma.professor.findFirst({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!professor) {
    redirect("/professor/nao-encontrado");
  }

  // Define os valores dos parâmetros de busca
  const tipo = searchParams.tipo || "TODOS";
  const busca = searchParams.busca;

  const ocorrencias = await getOcorrencias(
    professor.id,
    tipo,
    busca
  ) as OcorrenciaComAluno[];

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

  const getIcon = (tipo: string) => {
    switch (tipo.toUpperCase()) {
      case "ADVERTENCIA":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "ELOGIO":
        return <ThumbsUp className="w-5 h-5 text-green-500" />;
      case "COMUNICADO":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#374151]">
                Minhas Ocorrências
              </h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                Gerencie todas as ocorrências que você registrou
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <form className="flex gap-4">
                <div className="flex-1">
                  <Input
                    name="busca"
                    placeholder="Buscar por título, descrição ou aluno..."
                    defaultValue={busca}
                    className="w-full"
                  />
                </div>
                <div className="w-[200px]">
                  <Select name="tipo" defaultValue={tipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de ocorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos os tipos</SelectItem>
                      <SelectItem value="ADVERTENCIA">Advertência</SelectItem>
                      <SelectItem value="ELOGIO">Elogio</SelectItem>
                      <SelectItem value="COMUNICADO">Comunicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            {ocorrencias.length > 0 ? (
              ocorrencias.map((ocorrencia) => (
                <Link
                  key={ocorrencia.id}
                  href={`/professor/alunos/${ocorrencia.alunoId}`}
                >
                  <Card
                    className={`p-6 transition-all duration-200 ${getCardStyle(
                      ocorrencia.tipo
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getIcon(ocorrencia.tipo)}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getTagStyle(
                              ocorrencia.tipo
                            )}`}
                          >
                            {ocorrencia.tipo}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatarData(ocorrencia.dataOcorrencia)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {ocorrencia.titulo}
                        </h3>
                        <p className="text-gray-600 mb-2">{ocorrencia.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Aluno:</span>
                          <span className="font-medium text-gray-700">
                            {ocorrencia.aluno.user.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <AlertCircle className="w-5 h-5" />
                  <p>Nenhuma ocorrência encontrada</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 