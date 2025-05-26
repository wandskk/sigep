'use client';

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Search, Plus, Mail, Eye, TrashIcon, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Professor = {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  role: UserRole;
  image: string | null;
  firstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface SchoolProfessorsClientProps {
  schoolId: string;
  professors: Professor[];
}

export function SchoolProfessorsClient({ schoolId, professors }: SchoolProfessorsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);

  const filteredProfessors = professors.filter((professor) =>
    professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total de Professores</p>
              <h3 className="text-2xl font-bold text-blue-900">{professors.length}</h3>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ativos</p>
              <h3 className="text-2xl font-bold text-green-900">
                {professors.filter(p => p.emailVerified).length}
              </h3>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <UserIcon className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Pendentes</p>
              <h3 className="text-2xl font-bold text-purple-900">
                {professors.filter(p => !p.emailVerified).length}
              </h3>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <UserIcon className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de pesquisa e botão de adicionar professor */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar professores por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Link href={`/admin/escolas/${schoolId}/professores/novo`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Professor
          </Button>
        </Link>
      </div>

      {/* Tabela de professores */}
      <Card className="overflow-hidden border-0 shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span>Professor</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>Email</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/30">
              {filteredProfessors.length > 0 ? (
                filteredProfessors.map((professor) => (
                  <tr
                    key={professor.id}
                    className={`group transition-all duration-200 hover:bg-blue-50/50 ${
                      selectedProfessor === professor.id ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => setSelectedProfessor(professor.id === selectedProfessor ? null : professor.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
                          {professor.image ? (
                            <img
                              src={professor.image}
                              alt={professor.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{professor.name}</div>
                          <div className="text-xs text-gray-500">
                            Desde {format(new Date(professor.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{professor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        professor.emailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {professor.emailVerified ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/professores/${professor.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Ver perfil"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remover professor"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {searchTerm
                          ? "Nenhum professor encontrado"
                          : "Nenhum professor cadastrado"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchTerm
                          ? "Tente buscar com outros termos"
                          : "Comece adicionando um novo professor"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 