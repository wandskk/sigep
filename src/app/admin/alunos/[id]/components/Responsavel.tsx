"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { Plus, User, Mail, Phone, MapPin, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Parentesco } from "@prisma/client";

interface ResponsavelData {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  parentesco: Parentesco;
}

interface ResponsavelProps {
  alunoId: string;
}

export function Responsavel({ alunoId }: ResponsavelProps) {
  const [responsaveis, setResponsaveis] = useState<ResponsavelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<ResponsavelData | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    parentesco: Parentesco.PAI,
  });

  useEffect(() => {
    fetchResponsaveis();
  }, [alunoId]);

  const fetchResponsaveis = async () => {
    try {
      const response = await fetch(`/api/alunos/${alunoId}/responsaveis`);
      if (!response.ok) throw new Error("Erro ao carregar responsáveis");
      const data = await response.json();
      setResponsaveis(data);
    } catch (err) {
      setError("Erro ao carregar responsáveis");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingResponsavel
        ? `/api/alunos/${alunoId}/responsaveis/${editingResponsavel.id}`
        : `/api/alunos/${alunoId}/responsaveis`;
      
      const method = editingResponsavel ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao salvar responsável");

      toast.success(
        editingResponsavel
          ? "Responsável atualizado com sucesso!"
          : "Responsável adicionado com sucesso!"
      );
      
      setShowModal(false);
      setEditingResponsavel(null);
      resetForm();
      fetchResponsaveis();
    } catch (err) {
      toast.error("Erro ao salvar responsável");
    }
  };

  const handleEdit = (responsavel: ResponsavelData) => {
    setEditingResponsavel(responsavel);
    setFormData({
      nome: responsavel.nome,
      cpf: responsavel.cpf,
      email: responsavel.email,
      telefone: responsavel.telefone,
      endereco: responsavel.endereco,
      parentesco: responsavel.parentesco,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este responsável?")) return;

    try {
      const response = await fetch(`/api/alunos/${alunoId}/responsaveis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao remover responsável");

      toast.success("Responsável removido com sucesso!");
      fetchResponsaveis();
    } catch (err) {
      toast.error("Erro ao remover responsável");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      endereco: "",
      parentesco: Parentesco.PAI,
    });
  };

  const openAddModal = () => {
    setEditingResponsavel(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Responsáveis</h2>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Responsável
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {responsaveis.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Nenhum responsável cadastrado</p>
            <Button onClick={openAddModal} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro responsável
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {responsaveis.map((responsavel) => (
              <div
                key={responsavel.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {responsavel.nome}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{responsavel.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{responsavel.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{responsavel.endereco}</span>
                      </div>
                      <div>
                        <span className="font-medium">Parentesco: </span>
                        {responsavel.parentesco}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(responsavel)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(responsavel.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingResponsavel(null);
        }}
        title={editingResponsavel ? "Editar Responsável" : "Adicionar Responsável"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="parentesco">Parentesco</Label>
            <Select
              value={formData.parentesco}
              onValueChange={(value) => setFormData({ ...formData, parentesco: value as Parentesco })}
            >
              <option value={Parentesco.PAI}>Pai</option>
              <option value={Parentesco.MAE}>Mãe</option>
              <option value={Parentesco.AVO}>Avô/Avó</option>
              <option value={Parentesco.TIO}>Tio/Tia</option>
              <option value={Parentesco.IRMAO}>Irmão/Irmã</option>
              <option value={Parentesco.RESPONSAVEL_LEGAL}>Responsável Legal</option>
              <option value={Parentesco.OUTRO}>Outro</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingResponsavel(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingResponsavel ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 