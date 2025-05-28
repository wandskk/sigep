"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatarCPF, formatarTelefone } from "@/lib/utils/formatadores";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SchoolAutocomplete } from "@/components/ui/SchoolAutocomplete";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

interface Escola {
  id: string;
  name: string;
  turmas: {
    id: string;
    nome: string;
    codigo: string;
  }[];
}

interface NovoAlunoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  escolas: Escola[];
}

export function NovoAlunoForm({ onSuccess, onCancel, escolas }: NovoAlunoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    matricula: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscola) {
      toast.error("Selecione uma escola");
      return;
    }
    if (!selectedTurma) {
      toast.error("Selecione uma turma");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          escolaId: selectedEscola,
          turmaId: selectedTurma,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar aluno");
      }

      const data = await response.json();
      toast.success("Aluno cadastrado com sucesso!");
      router.push(`/admin/alunos/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      toast.error("Erro ao cadastrar aluno");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = formatarCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatarTelefone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert
        variant="info"
        title="Informações Importantes"
        icon={<Info className="h-4 w-4" />}
      >
        Preencha todos os campos obrigatórios marcados com *. O aluno receberá um e-mail com instruções para acessar o sistema.
      </Alert>

      <Tabs defaultValue="dados-pessoais" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="escola">Escola</TabsTrigger>
        </TabsList>

        <TabsContent value="dados-pessoais" className="mt-6">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
              />
              <Input
                label="CPF *"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <Input
                label="Data de Nascimento *"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
                required
              />
              <Input
                label="Matrícula *"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
                placeholder="Digite o número de matrícula"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contato" className="mt-6">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="E-mail *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Digite o e-mail"
              />
              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <Input
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Digite o endereço completo"
                className="md:col-span-2"
              />
              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Digite a cidade"
              />
              <Input
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="UF"
                maxLength={2}
              />
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="escola" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="escola">Escola</Label>
              <SchoolAutocomplete
                schools={escolas}
                onSelect={(escola) => {
                  setSelectedEscola(escola);
                  setSelectedTurma("");
                }}
              />
            </div>

            {selectedEscola && (
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select
                  value={selectedTurma}
                  onValueChange={setSelectedTurma}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEscola.turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          Cadastrar Aluno
        </Button>
      </div>
    </form>
  );
} 