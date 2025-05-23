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
import { 
  Search,
  UserPlus,
  FileText,
  Mail,
  Phone,
  MapPin,
  MoreVertical
} from "lucide-react";

export default function AlunosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Dados de exemplo - substituir por dados reais da API
  const alunos = [
    {
      id: 1,
      nome: "João Silva",
      matricula: "2024001",
      turma: "1º Ano A",
      status: "Ativo",
      responsavel: "Maria Silva",
      contato: "(84) 99999-9999",
      email: "maria.silva@email.com",
      endereco: "Rua das Flores, 123"
    },
    {
      id: 2,
      nome: "Maria Santos",
      matricula: "2024002",
      turma: "2º Ano B",
      status: "Ativo",
      responsavel: "José Santos",
      contato: "(84) 98888-8888",
      email: "jose.santos@email.com",
      endereco: "Av. Principal, 456"
    },
    // Adicionar mais dados de exemplo conforme necessário
  ];

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.matricula.includes(searchTerm) ||
      aluno.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || aluno.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie o cadastro de alunos
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, matrícula ou responsável..."
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
                <SelectItem value="Transferido">Transferido</SelectItem>
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
                  <TableHead>Responsável</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{aluno.matricula}</TableCell>
                    <TableCell>{aluno.turma}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${aluno.status === "Ativo" ? "bg-green-100 text-green-800" :
                          aluno.status === "Transferido" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"}`}>
                        {aluno.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{aluno.responsavel}</span>
                        <span className="text-sm text-gray-500">{aluno.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{aluno.contato}</span>
                        <span className="text-sm text-gray-500 truncate max-w-[200px]">
                          {aluno.endereco}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" title="Ver detalhes">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Enviar e-mail">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Ligar">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Ver endereço">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Mais opções">
                          <MoreVertical className="h-4 w-4" />
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
    </div>
  );
} 