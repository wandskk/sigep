"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/Select";
import { ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";

interface AlunoFormatado {
  id: string;
  nome: string;
  matricula: string;
  turmas: {
    id: string;
    nome: string;
    codigo: string;
  }[];
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
}

export default function AlunosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alunos, setAlunos] = useState<AlunoFormatado[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<string>("TODAS");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.PROFESSOR) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === UserRole.PROFESSOR) {
      fetchAlunos();
    }
  }, [session]);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/professor/alunos");
      if (!response.ok) {
        throw new Error("Erro ao carregar alunos");
      }
      const data = await response.json();
      setAlunos(data.alunos);
      
      // Extrair turmas únicas
      const turmasUnicas = new Map<string, Turma>();
      data.alunos.forEach((aluno: AlunoFormatado) => {
        aluno.turmas.forEach(turma => {
          if (!turmasUnicas.has(turma.id)) {
            turmasUnicas.set(turma.id, turma);
          }
        });
      });
      setTurmas(Array.from(turmasUnicas.values()));
    } catch (err) {
      setError("Erro ao carregar alunos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = selectedTurma === "TODAS" || 
                        aluno.turmas.some(t => t.id === selectedTurma);
    return matchesSearch && matchesTurma;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.PROFESSOR) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <Link href="/professor/turmas">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Turmas
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#374151]">
              Meus Alunos
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Lista de alunos das suas turmas
            </p>
          </div>

          <Card className="mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-full sm:w-64 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Select
                    value={selectedTurma}
                    onValueChange={setSelectedTurma}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Filtrar por turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODAS">Todas as turmas</SelectItem>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome} {turma.codigo && `(${turma.codigo})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome do Aluno
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlunos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum aluno encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredAlunos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {aluno.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {aluno.turmas.map((turma) => (
                              <span
                                key={turma.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {turma.nome} {turma.codigo && `(${turma.codigo})`}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
                            >
                              Ver detalhes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/professor/alunos/${aluno.id}/ocorrencias`)}
                            >
                              Ocorrências
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 