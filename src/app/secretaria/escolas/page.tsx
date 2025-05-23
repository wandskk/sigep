"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
  Search,
  Building2,
  Users,
  Users2,
  GraduationCap,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Plus
} from "lucide-react";

export default function EscolasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Dados de exemplo - substituir por dados reais da API
  const escolas = [
    {
      id: 1,
      nome: "Escola Municipal João da Silva",
      endereco: "Rua das Flores, 123 - Centro",
      telefone: "(84) 3333-3333",
      email: "contato@emjoaodasilva.edu.br",
      diretor: "Maria Oliveira",
      alunos: 320,
      professores: 18,
      turmas: 12,
      status: "Ativo",
      turmasDetalhadas: [
        { id: 1, nome: "1º Ano A", alunos: 25, professor: "Ana Santos", turno: "Manhã" },
        { id: 2, nome: "1º Ano B", alunos: 24, professor: "Pedro Lima", turno: "Manhã" },
        { id: 3, nome: "2º Ano A", alunos: 26, professor: "Carla Silva", turno: "Tarde" },
      ],
      professoresDetalhados: [
        { id: 1, nome: "Ana Santos", disciplina: "Português", turmas: 3, status: "Ativo" },
        { id: 2, nome: "Pedro Lima", disciplina: "Matemática", turmas: 4, status: "Ativo" },
        { id: 3, nome: "Carla Silva", disciplina: "História", turmas: 3, status: "Ativo" },
      ]
    },
    {
      id: 2,
      nome: "Escola Municipal Maria Santos",
      endereco: "Av. Principal, 456 - Bairro Novo",
      telefone: "(84) 4444-4444",
      email: "contato@emmariasantos.edu.br",
      diretor: "José Pereira",
      alunos: 280,
      professores: 15,
      turmas: 10,
      status: "Ativo",
      turmasDetalhadas: [
        { id: 1, nome: "1º Ano A", alunos: 28, professor: "João Costa", turno: "Manhã" },
        { id: 2, nome: "2º Ano A", alunos: 27, professor: "Maria Lima", turno: "Tarde" },
      ],
      professoresDetalhados: [
        { id: 1, nome: "João Costa", disciplina: "Geografia", turmas: 3, status: "Ativo" },
        { id: 2, nome: "Maria Lima", disciplina: "Ciências", turmas: 4, status: "Ativo" },
      ]
    },
  ];

  const filteredEscolas = escolas.filter(escola => {
    const matchesSearch = 
      escola.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escola.diretor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escola.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || escola.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escolas Municipais</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todas as escolas da rede municipal
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Escola
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome da escola, diretor ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEscolas.map((escola) => (
        <Card key={escola.id} className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{escola.nome}</CardTitle>
                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {escola.endereco}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {escola.telefone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {escola.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentos
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Total de Alunos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{escola.alunos}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Users2 className="h-4 w-4 mr-2" />
                    Professores
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{escola.professores}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Turmas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{escola.turmas}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Diretor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-lg font-semibold">{escola.diretor}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="turmas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="turmas">Turmas</TabsTrigger>
                <TabsTrigger value="professores">Professores</TabsTrigger>
                <TabsTrigger value="alunos">Alunos</TabsTrigger>
                <TabsTrigger value="calendario">Calendário Escolar</TabsTrigger>
              </TabsList>

              <TabsContent value="turmas">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Turma</TableHead>
                        <TableHead>Professor</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {escola.turmasDetalhadas.map((turma) => (
                        <TableRow key={turma.id}>
                          <TableCell className="font-medium">{turma.nome}</TableCell>
                          <TableCell>{turma.professor}</TableCell>
                          <TableCell>{turma.alunos}</TableCell>
                          <TableCell>{turma.turno}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="professores">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Professor</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Turmas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {escola.professoresDetalhados.map((professor) => (
                        <TableRow key={professor.id}>
                          <TableCell className="font-medium">{professor.nome}</TableCell>
                          <TableCell>{professor.disciplina}</TableCell>
                          <TableCell>{professor.turmas}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${professor.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {professor.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="alunos">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <Button variant="outline" size="sm">
                            Ver Lista Completa de Alunos
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="calendario">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendário Escolar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40">
                      <Calendar className="h-8 w-8 mr-2 text-gray-400" />
                      <p className="text-gray-500">Calendário escolar em desenvolvimento...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 