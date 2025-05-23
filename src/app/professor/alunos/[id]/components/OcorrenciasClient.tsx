"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatarData } from "@/lib/utils/formatadores";
import { 
  AlertCircle,
  Plus,
  Filter,
  Eye,
  UserCircle,
  Calendar
} from "lucide-react";
import { TipoOcorrencia, UserRole } from "@prisma/client";

interface Ocorrencia {
  id: string;
  tipo: TipoOcorrencia;
  titulo: string;
  descricao: string;
  dataOcorrencia: Date;
  dataRegistro: Date;
  visivelParaResponsavel: boolean;
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

const ocorrenciaSchema = z.object({
  tipo: z.nativeEnum(TipoOcorrencia),
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  dataOcorrencia: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "Data inválida"
  ),
  visivelParaResponsavel: z.boolean().default(false)
});

type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

export function OcorrenciasClient({ alunoId, ocorrenciasIniciais }: OcorrenciasClientProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(ocorrenciasIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoOcorrencia | "TODOS">("TODOS");

  const form = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      tipo: TipoOcorrencia.OUTRO,
      titulo: "",
      descricao: "",
      dataOcorrencia: new Date().toISOString().split("T")[0],
      visivelParaResponsavel: false
    }
  });

  const criarOcorrencia = async (data: OcorrenciaFormData) => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/professor/alunos/${alunoId}/ocorrencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Erro ao criar ocorrência");
      
      const novaOcorrencia = await response.json();
      setOcorrencias(prev => [novaOcorrencia, ...prev]);
      toast.success("Ocorrência registrada com sucesso!");
      setModalAberto(false);
      form.reset();
    } catch (error) {
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setCarregando(false);
    }
  };

  const ocorrenciasFiltradas = ocorrencias.filter(ocorrencia => 
    filtroTipo === "TODOS" || ocorrencia.tipo === filtroTipo
  );

  const getTipoColor = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-sm hover:shadow-md";
      case TipoOcorrencia.ELOGIO:
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-sm hover:shadow-md";
      case TipoOcorrencia.COMUNICADO:
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-sm hover:shadow-md";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 shadow-sm hover:shadow-md";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ocorrências</h2>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Select
              value={filtroTipo}
              onValueChange={(value) => setFiltroTipo(value as TipoOcorrencia | "TODOS")}
            >
              <SelectTrigger className="w-48 pl-9 bg-white border-gray-200 text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os tipos</SelectItem>
                <SelectItem value={TipoOcorrencia.ADVERTENCIA}>Advertências</SelectItem>
                <SelectItem value={TipoOcorrencia.ELOGIO}>Elogios</SelectItem>
                <SelectItem value={TipoOcorrencia.COMUNICADO}>Comunicados</SelectItem>
                <SelectItem value={TipoOcorrencia.OUTRO}>Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={() => {
            setModalAberto(true);
            form.reset();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : ocorrenciasFiltradas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {ocorrenciasFiltradas.map(ocorrencia => (
            <div 
              key={ocorrencia.id} 
              className={`p-6 rounded-xl border transition-all duration-200 ${getTipoColor(ocorrencia.tipo)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ocorrencia.tipo === TipoOcorrencia.ADVERTENCIA ? "bg-red-100 text-red-700" :
                      ocorrencia.tipo === TipoOcorrencia.ELOGIO ? "bg-green-100 text-green-700" :
                      ocorrencia.tipo === TipoOcorrencia.COMUNICADO ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {ocorrencia.tipo}
                    </div>
                    {ocorrencia.visivelParaResponsavel && (
                      <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs flex items-center gap-1" title="Visível para responsável">
                        <Eye className="w-3 h-3" />
                        <span>Visível</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1 truncate">{ocorrencia.titulo}</h3>
                  <p className="text-sm mb-3 line-clamp-2">{ocorrencia.descricao}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                      <UserCircle className="w-3 h-3" />
                      <span>{ocorrencia.autor.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      <span>{formatarData(ocorrencia.dataOcorrencia)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">
            {filtroTipo === "TODOS" 
              ? "Nenhuma ocorrência registrada" 
              : `Nenhuma ocorrência do tipo ${filtroTipo.toLowerCase()} registrada`}
          </p>
        </div>
      )}

      <Dialog open={modalAberto} onOpenChange={(open) => {
        if (!open) {
          setModalAberto(false);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Ocorrência</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={form.handleSubmit(criarOcorrencia)} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={form.watch("tipo")}
                onValueChange={(value) => form.setValue("tipo", value as TipoOcorrencia)}
              >
                <SelectTrigger id="tipo" className={form.formState.errors.tipo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoOcorrencia.ADVERTENCIA}>Advertência</SelectItem>
                  <SelectItem value={TipoOcorrencia.ELOGIO}>Elogio</SelectItem>
                  <SelectItem value={TipoOcorrencia.COMUNICADO}>Comunicado</SelectItem>
                  <SelectItem value={TipoOcorrencia.OUTRO}>Outro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.tipo && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.tipo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                {...form.register("titulo")}
                error={form.formState.errors.titulo?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...form.register("descricao")}
                error={form.formState.errors.descricao?.message}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataOcorrencia">Data da Ocorrência</Label>
              <Input
                id="dataOcorrencia"
                type="date"
                {...form.register("dataOcorrencia")}
                error={form.formState.errors.dataOcorrencia?.message}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visivelParaResponsavel"
                {...form.register("visivelParaResponsavel")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="visivelParaResponsavel" className="text-sm font-medium text-gray-700">
                Visível para o responsável
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalAberto(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={carregando}>
                {carregando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 