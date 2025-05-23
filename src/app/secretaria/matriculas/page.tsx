"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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
  UserPlus,
  RefreshCw,
  ArrowRightLeft,
  FileCheck
} from "lucide-react";

export default function MatriculasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Dados de exemplo - substituir por dados reais da API
  const matriculas = [
    {
      id: 1,
      aluno: "João Silva",
      matricula: "2024001",
      turma: "1º Ano A",
      status: "Ativo",
      dataMatricula: "15/02/2024",
      tipo: "Nova Matrícula"
    },
    {
      id: 2,
      aluno: "Maria Santos",
      matricula: "2024002",
      turma: "2º Ano B",
      status: "Transferência Pendente",
      dataMatricula: "16/02/2024",
      tipo: "Transferência"
    },
    // Adicionar mais dados de exemplo conforme necessário
  ];

  const filteredMatriculas = matriculas.filter(matricula => {
    const matchesSearch = matricula.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matricula.matricula.includes(searchTerm);
    const matchesStatus = statusFilter === "todos" || matricula.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrículas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as matrículas dos alunos
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Nova Matrícula
        </Button>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas as Matrículas</TabsTrigger>
          <TabsTrigger value="novas">Novas Matrículas</TabsTrigger>
          <TabsTrigger value="transferencias">Transferências</TabsTrigger>
          <TabsTrigger value="rematriculas">Rematrículas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Matrículas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome ou matrícula..."
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
                    <SelectItem value="Transferência Pendente">Transferência Pendente</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMatriculas.map((matricula) => (
                      <TableRow key={matricula.id}>
                        <TableCell className="font-medium">{matricula.aluno}</TableCell>
                        <TableCell>{matricula.matricula}</TableCell>
                        <TableCell>{matricula.turma}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${matricula.status === "Ativo" ? "bg-green-100 text-green-800" :
                              matricula.status === "Transferência Pendente" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"}`}>
                            {matricula.status}
                          </span>
                        </TableCell>
                        <TableCell>{matricula.dataMatricula}</TableCell>
                        <TableCell>{matricula.tipo}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <FileCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras abas serão implementadas posteriormente */}
        <TabsContent value="novas">
          <Card>
            <CardHeader>
              <CardTitle>Novas Matrículas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Implementação em andamento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transferencias">
          <Card>
            <CardHeader>
              <CardTitle>Transferências</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Implementação em andamento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rematriculas">
          <Card>
            <CardHeader>
              <CardTitle>Rematrículas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Implementação em andamento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 