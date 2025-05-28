"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { TabelaAlunos } from "@/components/tables/TabelaAlunos";
import { BuscaAlunos } from "./BuscaAlunos";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Pencil, UserCircle, School, Users, Calendar, Eye, Trash2 } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/Modal";
import { NovoAlunoForm } from "./NovoAlunoForm";
import type { AlunoFormatado } from "@/components/tables/TabelaAlunos";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/Table";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  escola: {
    id: string;
    name: string;
  } | null;
  turmas: {
    turma: {
      id: string;
      nome: string;
      codigo: string;
      escola: {
        id: string;
        name: string;
      };
    };
  }[];
}

interface Escola {
  id: string;
  name: string;
  turmas: {
    id: string;
    nome: string;
    codigo: string;
  }[];
}

export function AlunosAdminContent() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  useEffect(() => {
    fetchAlunos();
    fetchEscolas();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/alunos");
      if (!response.ok) {
        throw new Error("Erro ao buscar alunos");
      }
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao buscar alunos");
    } finally {
      setLoading(false);
    }
  };

  const fetchEscolas = async () => {
    try {
      const response = await fetch("/api/admin/schools");
      if (!response.ok) {
        throw new Error("Erro ao buscar escolas");
      }
      const data = await response.json();
      setEscolas(data);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      toast.error("Erro ao buscar escolas");
    }
  };

  const filteredAlunos = alunos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setModalOpen(false);
    fetchAlunos();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader 
          size="lg" 
          variant="primary" 
          text="Carregando alunos..." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Modal open={modalOpen} onOpenChange={setModalOpen}>
          <ModalTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </Button>
          </ModalTrigger>
          <ModalContent className="max-w-3xl">
            <ModalHeader>
              <ModalTitle>Novo Aluno</ModalTitle>
            </ModalHeader>
            <NovoAlunoForm
              onSuccess={() => {
                setModalOpen(false);
                fetchAlunos();
              }}
              onCancel={() => setModalOpen(false)}
              escolas={escolas}
            />
          </ModalContent>
        </Modal>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  NOME
                </div>
              </th>
              <th className="text-left p-4 font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-gray-400" />
                  ESCOLA
                </div>
              </th>
              <th className="text-left p-4 font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  MATRÍCULA
                </div>
              </th>
              <th className="text-left p-4 font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  AÇÕES
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredAlunos.map((aluno, idx) => (
              <tr
                key={aluno.id}
                className={`border-b transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/40`}
              >
                <td className="p-4 flex items-center gap-3">
                  <UserCircle className="w-8 h-8 text-blue-400 bg-blue-100 rounded-full p-1" />
                  <span className="font-medium text-gray-900">{aluno.nome}</span>
                </td>
                <td className="p-4 text-gray-700">
                  {aluno.escola ? aluno.escola.name : "Não matriculado"}
                </td>
                <td className="p-4 text-gray-700">{aluno.matricula}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/alunos/${aluno.id}`)}
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/alunos/${aluno.id}`)}
                      title="Editar"
                    >
                      <Pencil className="w-5 h-5 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* ação de deletar futuro */}}
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5 text-gray-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 