"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Plus, AlertTriangle, ThumbsUp, MessageCircle, FileText, Eye, Calendar, User, Info, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TipoOcorrencia } from "@prisma/client";
import { useSession } from "next-auth/react";

interface Ocorrencia {
  id: string;
  tipo: TipoOcorrencia;
  titulo: string;
  descricao: string;
  dataOcorrencia: string;
  visivelParaResponsavel: boolean;
  autor: {
    id: string;
    name: string;
    role: string;
  };
}

interface OcorrenciasClientProps {
  alunoId: string;
  ocorrenciasIniciais: Ocorrencia[];
}

export function OcorrenciasClient({ alunoId, ocorrenciasIniciais }: OcorrenciasClientProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(ocorrenciasIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [formData, setFormData] = useState({
    tipo: "OUTRO",
    titulo: "",
    descricao: "",
    dataOcorrencia: new Date().toISOString().split("T")[0],
    visivelParaResponsavel: false
  });
  const [ocorrenciaEmEdicao, setOcorrenciaEmEdicao] = useState<Ocorrencia | null>(null);
  const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(false);
  const [ocorrenciaParaExcluir, setOcorrenciaParaExcluir] = useState<Ocorrencia | null>(null);

  const criarOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCarregando(true);
      const response = await fetch(`/api/alunos/${alunoId}/ocorrencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Erro ao criar ocorrência");
      
      const novaOcorrencia = await response.json();
      setOcorrencias(prev => [novaOcorrencia, ...prev]);
      toast.success("Ocorrência registrada com sucesso!");
      setModalAberto(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setCarregando(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "OUTRO",
      titulo: "",
      descricao: "",
      dataOcorrencia: new Date().toISOString().split("T")[0],
      visivelParaResponsavel: false
    });
  };

  const getTipoIcon = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return <AlertTriangle className="w-5 h-5" />;
      case TipoOcorrencia.ELOGIO:
        return <ThumbsUp className="w-5 h-5" />;
      case TipoOcorrencia.COMUNICADO:
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTipoColor = (tipo: TipoOcorrencia) => {
    switch (tipo) {
      case TipoOcorrencia.ADVERTENCIA:
        return "border-red-200 bg-red-50 hover:border-red-300";
      case TipoOcorrencia.ELOGIO:
        return "border-green-200 bg-green-50 hover:border-green-300";
      case TipoOcorrencia.COMUNICADO:
        return "border-blue-200 bg-blue-50 hover:border-blue-300";
      default:
        return "border-gray-200 bg-gray-50 hover:border-gray-300";
    }
  };

  const ocorrenciasFiltradas = filtroTipo === "TODOS" 
    ? ocorrencias 
    : ocorrencias.filter(o => o.tipo.toString() === filtroTipo);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  function handleEditarOcorrencia(ocorrencia: Ocorrencia) {
    setOcorrenciaEmEdicao(ocorrencia);
    setFormData({
      tipo: ocorrencia.tipo.toString(),
      titulo: ocorrencia.titulo,
      descricao: ocorrencia.descricao,
      dataOcorrencia: typeof ocorrencia.dataOcorrencia === "string"
        ? ocorrencia.dataOcorrencia.split("T")[0]
        : new Date(ocorrencia.dataOcorrencia).toISOString().split("T")[0],
      visivelParaResponsavel: ocorrencia.visivelParaResponsavel,
    });
    setModalAberto(true);
  }

  function handleExcluirOcorrencia(ocorrencia: Ocorrencia) {
    setOcorrenciaParaExcluir(ocorrencia);
    setModalConfirmarExclusao(true);
  }

  async function confirmarExclusao() {
    if (!ocorrenciaParaExcluir) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/ocorrencias/${ocorrenciaParaExcluir.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOcorrencias(prev => prev.filter(o => o.id !== ocorrenciaParaExcluir.id));
        toast.success("Ocorrência excluída com sucesso!");
      } else {
        toast.error("Erro ao excluir ocorrência");
      }
    } catch {
      toast.error("Erro ao excluir ocorrência");
    } finally {
      setCarregando(false);
      setModalConfirmarExclusao(false);
      setOcorrenciaParaExcluir(null);
    }
  }

  async function salvarOcorrencia(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (ocorrenciaEmEdicao) {
        // Edição
        const res = await fetch(`/api/ocorrencias/${ocorrenciaEmEdicao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const atualizada = await res.json();
          setOcorrencias(prev => prev.map(o => o.id === atualizada.id ? atualizada : o));
          toast.success("Ocorrência atualizada!");
        } else {
          toast.error("Erro ao atualizar ocorrência");
        }
      } else {
        // Nova ocorrência
        const response = await fetch(`/api/alunos/${alunoId}/ocorrencias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Erro ao criar ocorrência");
        const novaOcorrencia = await response.json();
        setOcorrencias(prev => [novaOcorrencia, ...prev]);
        toast.success("Ocorrência registrada com sucesso!");
      }
      setModalAberto(false);
      setOcorrenciaEmEdicao(null);
      resetForm();
    } catch {
      toast.error("Erro ao salvar ocorrência");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Ocorrências</h2>
            <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as string)}> 
              <SelectTrigger className="w-[160px] ml-4">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os tipos</SelectItem>
                <SelectItem value="ADVERTENCIA">Advertência</SelectItem>
                <SelectItem value="ELOGIO">Elogio</SelectItem>
                <SelectItem value="COMUNICADO">Comunicado</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              setModalAberto(true);
              setOcorrenciaEmEdicao(null);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
          </div>
        ) : ocorrenciasFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg border border-gray-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 bg-gray-50 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 bg-gray-50 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 bg-gray-50 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 bg-gray-50 uppercase tracking-wider">Autor</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 bg-gray-50 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ocorrenciasFiltradas.map((ocorrencia, idx) => (
                  <tr key={ocorrencia.id} className={"transition-colors duration-150 " + (idx % 2 === 0 ? "bg-white" : "bg-gray-50") + " hover:bg-blue-50/40"}>
                    <td className="px-4 py-3 font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm
                        ${ocorrencia.tipo === "ADVERTENCIA" ? "bg-red-100 text-red-700 border border-red-200" : ""}
                        ${ocorrencia.tipo === "ELOGIO" ? "bg-green-100 text-green-700 border border-green-200" : ""}
                        ${ocorrencia.tipo === "COMUNICADO" ? "bg-blue-100 text-blue-700 border border-blue-200" : ""}
                        ${ocorrencia.tipo === "OUTRO" ? "bg-gray-100 text-gray-700 border border-gray-200" : ""}
                      `}>
                        {ocorrencia.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-base">{ocorrencia.titulo}</td>
                    <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>{formatarData(ocorrencia.dataOcorrencia)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{ocorrencia.autor.name}</td>
                    <td className="px-4 py-3 text-center">
                      {(user?.role === "ADMIN" || user?.role === "GESTOR" || user?.id === ocorrencia.autor.id) && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditarOcorrencia(ocorrencia)}
                            className="p-2 rounded-full bg-white border border-blue-100 shadow hover:bg-blue-100 hover:text-blue-800 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirOcorrencia(ocorrencia)}
                            className="p-2 rounded-full bg-white border border-red-100 shadow hover:bg-red-100 hover:text-red-800 transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {filtroTipo === "TODOS" ? "Nenhuma ocorrência registrada" : `Nenhuma ocorrência do tipo ${filtroTipo}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filtroTipo === "TODOS" 
                ? "Registre a primeira ocorrência para este aluno" 
                : "Tente alterar o filtro ou registrar uma nova ocorrência"
              }
            </p>
            <Button onClick={() => setModalAberto(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Registrar ocorrência
            </Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setOcorrenciaEmEdicao(null);
          resetForm();
        }}
        title={ocorrenciaEmEdicao ? "Editar Ocorrência" : "Nova Ocorrência"}
      >
        <form onSubmit={salvarOcorrencia} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Ocorrência</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADVERTENCIA">Advertência</SelectItem>
                  <SelectItem value="ELOGIO">Elogio</SelectItem>
                  <SelectItem value="COMUNICADO">Comunicado</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataOcorrencia">Data da Ocorrência</Label>
              <Input
                id="dataOcorrencia"
                type="date"
                value={formData.dataOcorrencia}
                onChange={(e) => setFormData({ ...formData, dataOcorrencia: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Título da ocorrência"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva a ocorrência..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visivelParaResponsavel"
              checked={formData.visivelParaResponsavel}
              onChange={(e) => setFormData({ ...formData, visivelParaResponsavel: e.target.checked })}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="visivelParaResponsavel" className="text-sm">
              Visível para responsável
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalAberto(false);
                setOcorrenciaEmEdicao(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={carregando}
            >
              {carregando ? "Salvando..." : (ocorrenciaEmEdicao ? "Salvar" : "Registrar")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalConfirmarExclusao}
        onClose={() => setModalConfirmarExclusao(false)}
        title="Confirmar Exclusão"
      >
        <div className="p-6">
          <p className="mb-4">Tem certeza que deseja excluir esta ocorrência?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalConfirmarExclusao(false)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={confirmarExclusao} disabled={carregando}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 