"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  School,
  GraduationCap, 
  BookOpen,
  ClipboardList,
  UserPlus,
  FileText,
  BarChart3,
  Building2,
  Users2,
  BookOpenCheck,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function SecretariaPage() {
  // Dados de exemplo - substituir por dados reais da API
  const estatisticas = {
    totalEscolas: 5,
    totalAlunos: 1250,
    totalProfessores: 85,
    totalTurmas: 45,
    matriculasPendentes: 12,
    transferenciasPendentes: 8,
    documentosPendentes: 15
  };

  const escolas = [
    {
      id: 1,
      nome: "Escola Municipal João da Silva",
      alunos: 320,
      professores: 18,
      turmas: 12,
      status: "Ativo"
    },
    {
      id: 2,
      nome: "Escola Municipal Maria Santos",
      alunos: 280,
      professores: 15,
      turmas: 10,
      status: "Ativo"
    },
    {
      id: 3,
      nome: "Escola Municipal José Oliveira",
      alunos: 250,
      professores: 14,
      turmas: 9,
      status: "Ativo"
    },
    // Adicionar mais escolas conforme necessário
  ];

  const funcionalidades = [
    {
      titulo: "Escolas",
      descricao: "Visualizar e gerenciar todas as escolas municipais",
      icone: <Building2 className="h-6 w-6" />,
      href: "/secretaria/escolas",
      cor: "from-blue-500 to-blue-600",
      estatistica: estatisticas.totalEscolas
    },
    {
      titulo: "Alunos",
      descricao: "Gerenciar cadastro de alunos de todas as escolas",
      icone: <Users className="h-6 w-6" />,
      href: "/secretaria/alunos",
      cor: "from-green-500 to-green-600",
      estatistica: estatisticas.totalAlunos
    },
    {
      titulo: "Professores",
      descricao: "Gerenciar cadastro de professores",
      icone: <Users2 className="h-6 w-6" />,
      href: "/secretaria/professores",
      cor: "from-purple-500 to-purple-600",
      estatistica: estatisticas.totalProfessores
    },
    {
      titulo: "Turmas",
      descricao: "Gerenciar turmas de todas as escolas",
      icone: <GraduationCap className="h-6 w-6" />,
      href: "/secretaria/turmas",
      cor: "from-yellow-500 to-yellow-600",
      estatistica: estatisticas.totalTurmas
    },
    {
      titulo: "Matrículas",
      descricao: "Gerenciar matrículas e transferências",
      icone: <UserPlus className="h-6 w-6" />,
      href: "/secretaria/matriculas",
      cor: "from-red-500 to-red-600",
      estatistica: estatisticas.matriculasPendentes,
      label: "Pendentes"
    },
    {
      titulo: "Documentos",
      descricao: "Emitir e gerenciar documentos escolares",
      icone: <FileText className="h-6 w-6" />,
      href: "/secretaria/documentos",
      cor: "from-indigo-500 to-indigo-600",
      estatistica: estatisticas.documentosPendentes,
      label: "Pendentes"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Secretaria Municipal de Educação</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do sistema educacional municipal
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Escolas
            </CardTitle>
            <School className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalEscolas}</div>
            <p className="text-xs text-gray-500 mt-1">Escolas municipais ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalAlunos}</div>
            <p className="text-xs text-gray-500 mt-1">Alunos matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Professores
            </CardTitle>
            <Users2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalProfessores}</div>
            <p className="text-xs text-gray-500 mt-1">Professores ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Turmas
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalTurmas}</div>
            <p className="text-xs text-gray-500 mt-1">Turmas em funcionamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Escolas */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Escolas Municipais</h2>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Relatório Completo
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {escolas.map((escola) => (
            <Card key={escola.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg">{escola.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{escola.alunos}</div>
                    <div className="text-xs text-gray-500">Alunos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{escola.professores}</div>
                    <div className="text-xs text-gray-500">Professores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{escola.turmas}</div>
                    <div className="text-xs text-gray-500">Turmas</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status: {escola.status}</span>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Funcionalidades */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionalidades.map((func) => (
            <Link key={func.href} href={func.href}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold">
                    {func.titulo}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${func.cor} text-white`}>
                    {func.icone}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <p className="text-gray-600">{func.descricao}</p>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{func.estatistica}</div>
                      {func.label && (
                        <div className="text-xs text-gray-500">{func.label}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 