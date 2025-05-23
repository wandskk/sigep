"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatarData } from "@/lib/utils/formatadores";
import { 
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  UserCircle,
  Calendar,
  Eye,
  EyeOff
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

interface OcorrenciasProps {
  alunoId: string;
}

// Schema de validação
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

export function Ocorrencias({ alunoId }: OcorrenciasProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [modalAberto, setModalAberto] = useState<"criar" | "editar" | null>(null);
  const [ocorrenciaEditando, setOcorrenciaEditando] = useState<Ocorrencia | null>(null);
  const [carregando, setCarregando] = useState(true);
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

  // Carregar ocorrências
  const carregarOcorrencias = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/alunos/${alunoId}/ocorrencias`);
      if (!response.ok) throw new Error("Erro ao carregar ocorrências");
      const data = await response.json();
      setOcorrencias(data);
    } catch (error) {
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setCarregando(false);
    }
  };

  // Carregar ocorrências ao montar o componente
  useEffect(() => {
    carregarOcorrencias();
  }, [alunoId]);

  // Criar ocorrência
  const criarOcorrencia = async (data: OcorrenciaFormData) => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/alunos/${alunoId}/ocorrencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Erro ao criar ocorrência");
      
      toast.success("Ocorrência registrada com sucesso!");
      setModalAberto(null);
      form.reset();
      carregarOcorrencias();
    } catch (error) {
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setCarregando(false);
    }
  };

  // Editar ocorrência
  const editarOcorrencia = async (data: OcorrenciaFormData) => {
    if (!ocorrenciaEditando) return;

    try {
      setCarregando(true);
      const response = await fetch(`/api/ocorrencias/${ocorrenciaEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Erro ao editar ocorrência");
      
      toast.success("Ocorrência atualizada com sucesso!");
      setModalAberto(null);
      setOcorrenciaEditando(null);
      form.reset();
      carregarOcorrencias();
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência");
    } finally {
      setCarregando(false);
    }
  };

  // Excluir ocorrência
  const excluirOcorrencia = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;

    try {
      setCarregando(true);
      const response = await fetch(`/api/ocorrencias/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Erro ao excluir ocorrência");
      
      toast.success("Ocorrência excluída com sucesso!");
      carregarOcorrencias();
    } catch (error) {
      toast.error("Erro ao excluir ocorrência");
    } finally {
      setCarregando(false);
    }
  };

  // Abrir modal de edição
  const abrirModalEdicao = (ocorrencia: Ocorrencia) => {
    setOcorrenciaEditando(ocorrencia);
    form.reset({
      tipo: ocorrencia.tipo,
      titulo: ocorrencia.titulo,
      descricao: ocorrencia.descricao,
      dataOcorrencia: new Date(ocorrencia.dataOcorrencia).toISOString().split("T")[0],
      visivelParaResponsavel: ocorrencia.visivelParaResponsavel
    });
    setModalAberto("editar");
  };

  // Filtrar ocorrências por tipo
  const ocorrenciasFiltradas = ocorrencias.filter(ocorrencia => 
    filtroTipo === "TODOS" || ocorrencia.tipo === filtroTipo
  );

  // Renderizar formulário
  const renderFormulario = () => (
    <form 
      onSubmit={form.handleSubmit(modalAberto === "criar" ? criarOcorrencia : editarOcorrencia)} 
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select
          id="tipo"
          {...form.register("tipo")}
          error={form.formState.errors.tipo?.message}
        >
          <option value={TipoOcorrencia.ADVERTENCIA}>Advertência</option>
          <option value={TipoOcorrencia.ELOGIO}>Elogio</option>
          <option value={TipoOcorrencia.COMUNICADO}>Comunicado</option>
          <option value={TipoOcorrencia.OUTRO}>Outro</option>
        </Select>
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
            setModalAberto(null);
            setOcorrenciaEditando(null);
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
  );

  // Renderizar card de ocorrência
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

  const renderOcorrenciaCard = (ocorrencia: Ocorrencia) => {
    return (
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
            
            <div className="flex items-center gap-4 text-xs">
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
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => abrirModalEdicao(ocorrencia)}
              className="text-gray-500 hover:text-gray-700 bg-white/50 hover:bg-white/80"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => excluirOcorrencia(ocorrencia.id)}
              className="text-gray-500 hover:text-red-600 bg-white/50 hover:bg-white/80"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ocorrências</h2>
          </div>
          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoOcorrencia | "TODOS")}
            className="w-40"
          >
            <option value="TODOS">Todos os tipos</option>
            <option value={TipoOcorrencia.ADVERTENCIA}>Advertências</option>
            <option value={TipoOcorrencia.ELOGIO}>Elogios</option>
            <option value={TipoOcorrencia.COMUNICADO}>Comunicados</option>
            <option value={TipoOcorrencia.OUTRO}>Outros</option>
          </Select>
        </div>
        <Button
          onClick={() => {
            setModalAberto("criar");
            form.reset();
          }}
          className="bg-blue-600 hover:bg-blue-700"
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
        <div className="space-y-2">
          {ocorrenciasFiltradas.map(renderOcorrenciaCard)}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">
            {filtroTipo === "TODOS" 
              ? "Nenhuma ocorrência registrada" 
              : `Nenhuma ocorrência do tipo ${filtroTipo.toLowerCase()} registrada`}
          </p>
        </div>
      )}

      <Dialog open={modalAberto !== null} onOpenChange={() => {
        setModalAberto(null);
        setOcorrenciaEditando(null);
        form.reset();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {modalAberto === "criar" ? "Nova Ocorrência" : "Editar Ocorrência"}
            </DialogTitle>
          </DialogHeader>
          {renderFormulario()}
        </DialogContent>
      </Dialog>
    </div>
  );
} 