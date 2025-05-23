"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { TipoOcorrencia, UserRole } from "@prisma/client";
import { AlertCircle, Calendar, Clock, User, Plus, Search } from "lucide-react";
import { formatarData } from "@/lib/utils/formatadores";

interface Ocorrencia {
  id: string;
  tipo: TipoOcorrencia;
  descricao: string;
  dataOcorrencia: Date;
  dataRegistro: Date;
  autor: {
    id: string;
    name: string;
    role: UserRole;
  };
}

interface OcorrenciasClientProps {
  alunoId: string;
  ocorrenciasIniciais: Ocorrencia[];
}

export function OcorrenciasClient({ alunoId, ocorrenciasIniciais }: OcorrenciasClientProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(ocorrenciasIniciais);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<TipoOcorrencia | "TODOS">("TODOS");
  const { toast } = useToast();

  const [novaOcorrencia, setNovaOcorrencia] = useState({
    tipo: "" as TipoOcorrencia | "",
    titulo: "",
    descricao: "",
    dataOcorrencia: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/professor/alunos/${alunoId}/ocorrencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaOcorrencia),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar ocorrência");
      }

      const data = await response.json();
      setOcorrencias((prev) => [data, ...prev]);
      setIsDialogOpen(false);
      setNovaOcorrencia({
        tipo: "",
        titulo: "",
        descricao: "",
        dataOcorrencia: new Date().toISOString().split("T")[0],
      });

      toast({
        title: "Ocorrência criada",
        children: "A ocorrência foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        children: "Não foi possível criar a ocorrência. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTagStyle = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return "bg-red-100 text-red-700 border-red-200";
      case TipoOcorrencia.ELOGIO:
        return "bg-green-100 text-green-700 border-green-200";
      case TipoOcorrencia.COMUNICADO:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCardStyle = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return "border-red-200 hover:border-red-300";
      case TipoOcorrencia.ELOGIO:
        return "border-green-200 hover:border-green-300";
      case TipoOcorrencia.COMUNICADO:
        return "border-blue-200 hover:border-blue-300";
      default:
        return "border-gray-200 hover:border-gray-300";
    }
  };

  const getTextStyle = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return "text-red-700";
      case TipoOcorrencia.ELOGIO:
        return "text-green-700";
      case TipoOcorrencia.COMUNICADO:
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  const filteredOcorrencias = ocorrencias.filter((ocorrencia) => {
    const matchesSearch = searchTerm === "" || 
      ocorrencia.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.autor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = selectedTipo === "TODOS" || ocorrencia.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar ocorrências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTipo} onValueChange={(value) => setSelectedTipo(value as TipoOcorrencia | "TODOS")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value={TipoOcorrencia.ADVERTENCIA}>Advertência</SelectItem>
              <SelectItem value={TipoOcorrencia.ELOGIO}>Elogio</SelectItem>
              <SelectItem value={TipoOcorrencia.COMUNICADO}>Comunicado</SelectItem>
              <SelectItem value={TipoOcorrencia.OUTRO}>Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Ocorrência</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={novaOcorrencia.tipo}
                  onValueChange={(value) => setNovaOcorrencia((prev) => ({ ...prev, tipo: value as TipoOcorrencia }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoOcorrencia.ADVERTENCIA}>Advertência</SelectItem>
                    <SelectItem value={TipoOcorrencia.ELOGIO}>Elogio</SelectItem>
                    <SelectItem value={TipoOcorrencia.COMUNICADO}>Comunicado</SelectItem>
                    <SelectItem value={TipoOcorrencia.OUTRO}>Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novaOcorrencia.titulo}
                  onChange={(e) => setNovaOcorrencia((prev) => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Digite o título da ocorrência"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataOcorrencia">Data da Ocorrência</Label>
                <Input
                  id="dataOcorrencia"
                  type="date"
                  value={novaOcorrencia.dataOcorrencia}
                  onChange={(e) => setNovaOcorrencia((prev) => ({ ...prev, dataOcorrencia: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaOcorrencia.descricao}
                  onChange={(e) => setNovaOcorrencia((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva a ocorrência..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {filteredOcorrencias.length === 0 ? (
          <Card className="p-6">
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="w-5 h-5" />
              <p>Nenhuma ocorrência encontrada</p>
            </div>
          </Card>
        ) : (
          filteredOcorrencias.map((ocorrencia) => (
            <Card
              key={ocorrencia.id}
              className={`p-6 transition-all duration-200 ${getCardStyle(ocorrencia.tipo)}`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-sm font-medium rounded-full border ${getTagStyle(ocorrencia.tipo)}`}>
                      {ocorrencia.tipo.charAt(0) + ocorrencia.tipo.slice(1).toLowerCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatarData(ocorrencia.dataOcorrencia)}
                    </span>
                  </div>
                </div>

                <p className={`text-base whitespace-pre-wrap ${getTextStyle(ocorrencia.tipo)}`}>
                  {ocorrencia.descricao}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{ocorrencia.autor.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Registrado em {formatarData(ocorrencia.dataRegistro)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 