import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { OcorrenciasClient } from "@/components/ocorrencias/OcorrenciasClient";
import { UserRole, TipoOcorrencia } from "@prisma/client";
import { ArrowLeft, UserCircle, Mail, Phone, MapPin, School, Calendar, Clock, AlertCircle, FileText, Hash } from "lucide-react";
import Link from "next/link";
import { formatarData, formatarCPF, formatarTelefone, formatarEmail } from "@/lib/utils/formatadores";

interface PageProps {
  params: {
    id: string;
  };
}

async function getResumoOcorrencias(alunoId: string) {
  // Busca todas as ocorrências agrupadas por tipo
  const ocorrencias = await prisma.ocorrencia.groupBy({
    by: ['tipo'],
    where: { 
      alunoId
    },
    _count: true,
  });

  // Cria um mapa com todos os tipos possíveis de ocorrência
  const todosTipos = Object.values(TipoOcorrencia);
  
  // Retorna um array com todos os tipos, mesmo que não tenham ocorrências
  return todosTipos.map(tipo => {
    const ocorrencia = ocorrencias.find(oc => oc.tipo === tipo);
    return {
      tipo,
      count: ocorrencia?._count || 0
    };
  });
}

async function getOcorrenciasIniciais(alunoId: string) {
  const ocorrencias = await prisma.ocorrencia.findMany({
    where: { 
      alunoId
    },
    include: {
      autor: {
        select: {
          id: true,
          name: true,
          role: true
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

async function getResponsaveis(alunoId: string) {
  const responsaveis = await prisma.responsavel.findMany({
    where: {
      alunoId
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
      parentesco: true
    }
  });

  return responsaveis;
}

export default async function AlunoPage({ params }: PageProps) {
  const { id } = await params;
  let aluno;
  let error: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.PROFESSOR) {
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

  // Busca o aluno e verifica se o professor tem acesso através das turmas
  aluno = await prisma.aluno.findFirst({
    where: {
      id,
      turmas: {
        some: {
          turma: {
            professores: {
              some: {
                professorId: professor.id,
              },
            },
          },
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      turmas: {
        include: {
          turma: {
            include: {
              escola: true,
            },
          },
        },
      },
    },
  });

  if (!aluno) {
    redirect("/professor/alunos");
  }

  const [resumoOcorrencias, ocorrenciasIniciais, responsaveis] = await Promise.all([
    getResumoOcorrencias(id),
    getOcorrenciasIniciais(id),
    getResponsaveis(id)
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

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/professor/alunos">
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
              <TabsTrigger value="responsaveis">Responsável</TabsTrigger>
              <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="dados">
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <UserCircle className="w-6 h-6 text-blue-600" />
                      <h2 className="text-lg font-semibold text-blue-900">Informações Básicas</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <UserCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Nome Completo</p>
                          <p className="mt-1 text-base text-gray-900">{aluno.user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Data de Nascimento</p>
                          <p className="mt-1 text-base text-gray-900">{formatarData(aluno.dataNascimento)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">CPF</p>
                          <p className="mt-1 text-base text-gray-900">{formatarCPF(aluno.cpf)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Matrícula</p>
                          <p className="mt-1 text-base text-gray-900">{aluno.matricula}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Contato */}
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-6 h-6 text-green-600" />
                      <h2 className="text-lg font-semibold text-green-900">Contato</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Email</p>
                          <p className="mt-1 text-base text-gray-900">{formatarEmail(aluno.user.email)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Telefone</p>
                          <p className="mt-1 text-base text-gray-900">{formatarTelefone(aluno.telefone)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Endereço</p>
                          <p className="mt-1 text-base text-gray-900">
                            {aluno.endereco}, {aluno.cidade} - {aluno.estado}, CEP: {aluno.cep}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Turma */}
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <div className="flex items-center gap-2 mb-4">
                      <School className="w-6 h-6 text-purple-600" />
                      <h2 className="text-lg font-semibold text-purple-900">Turma Atual</h2>
                    </div>
                    {aluno.turmas.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {aluno.turmas.map((at) => (
                          <div
                            key={at.turma.id}
                            className="bg-white rounded-lg border border-purple-100 p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                  <School className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-purple-900">
                                    {at.turma.nome}
                                  </h4>
                                  <span className="text-sm text-purple-600">{at.turma.escola.name}</span>
                                </div>
                              </div>
                              {at.turma.codigo && (
                                <span className="px-2.5 py-1 text-sm font-medium text-purple-700 bg-purple-50 rounded-full">
                                  {at.turma.codigo}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-4 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm">Aluno não está matriculado em nenhuma turma</p>
                      </div>
                    )}
                  </Card>

                  {/* Informações Adicionais */}
                  <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-6 h-6 text-amber-600" />
                      <h2 className="text-lg font-semibold text-amber-900">Informações Adicionais</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Data de Cadastro</p>
                          <p className="mt-1 text-base text-gray-900">{formatarData(aluno.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Última Atualização</p>
                          <p className="mt-1 text-base text-gray-900">{formatarData(aluno.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Situação</p>
                          <p className="mt-1 text-base text-gray-900">{aluno.situacao}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Data de Matrícula</p>
                          <p className="mt-1 text-base text-gray-900">{formatarData(aluno.dataMatricula)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="responsaveis">
                <div className="space-y-6">
                  {responsaveis.length > 0 ? (
                    responsaveis.map((responsavel) => (
                      <Card key={responsavel.id} className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                          <UserCircle className="w-6 h-6 text-indigo-600" />
                          <h2 className="text-lg font-semibold text-indigo-900">Responsável</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="flex items-start gap-3">
                            <UserCircle className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-indigo-700">Nome Completo</p>
                              <p className="mt-1 text-base text-gray-900">{responsavel.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-indigo-700">Email</p>
                              <p className="mt-1 text-base text-gray-900">{formatarEmail(responsavel.email)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-indigo-700">Telefone</p>
                              <p className="mt-1 text-base text-gray-900">{formatarTelefone(responsavel.telefone)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Hash className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-indigo-700">CPF</p>
                              <p className="mt-1 text-base text-gray-900">{formatarCPF(responsavel.cpf)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <UserCircle className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-indigo-700">Parentesco</p>
                              <p className="mt-1 text-base text-gray-900">{responsavel.parentesco}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <AlertCircle className="w-5 h-5" />
                        <p>Nenhum responsável cadastrado</p>
                      </div>
                    </Card>
                  )}
                </div>
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
} 