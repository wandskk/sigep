"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface School {
  id: string;
  name: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  turno: string;
  escolaId: string;
}

interface ClassFormProps {
  schools: School[];
  initialData?: Turma;
}

export function ClassForm({ schools, initialData }: ClassFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    turno: initialData?.turno || "MATUTINO",
    escolaId: initialData?.escolaId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = initialData
        ? `/api/admin/schools/${formData.escolaId}/classes/${initialData.id}`
        : `/api/admin/schools/${formData.escolaId}/classes`;

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          initialData ? "Erro ao atualizar turma" : "Erro ao criar turma"
        );
      }

      router.push("/admin/turmas");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : initialData
          ? "Erro ao atualizar turma"
          : "Erro ao criar turma"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/turmas">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {initialData ? "Editar Turma" : "Nova Turma"}
          </h1>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="escolaId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Escola
              </label>
              <select
                id="escolaId"
                value={formData.escolaId}
                onChange={(e) =>
                  setFormData({ ...formData, escolaId: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="">Selecione uma escola</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome da Turma
              </label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
                placeholder="Ex: Turma A, 1º Ano A, etc."
              />
            </div>

            <div>
              <label
                htmlFor="turno"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Turno
              </label>
              <select
                id="turno"
                value={formData.turno}
                onChange={(e) =>
                  setFormData({ ...formData, turno: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="MATUTINO">Matutino</option>
                <option value="VESPERTINO">Vespertino</option>
                <option value="NOTURNO">Noturno</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Link href="/admin/turmas">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting
                  ? initialData
                    ? "Salvando..."
                    : "Criando..."
                  : initialData
                  ? "Salvar Alterações"
                  : "Criar Turma"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
} 