"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { TurmaHeader } from "./TurmaHeader";
import { TabelaDisciplinas } from "./TabelaDisciplinas";
import { ModalDisciplinas } from "./ModalDisciplinas";
import { ModalAtribuirProfessor } from "./ModalAtribuirProfessor";
import { ModalConfirmarExclusao } from "./ModalConfirmarExclusao";
import { TurmaCompleta, ProfessorInfo, DisciplinaBasica } from "@/lib/types";

interface DisciplinaTurma {
  id: string;
  nome: string;
  professor: {
    id: string;
    nome: string;
  } | null;
}

interface TurmaContentProps {
  turma: TurmaCompleta;
  professores: ProfessorInfo[];
  disciplinas: DisciplinaBasica[];
}

export default function TurmaContent({
  turma,
  professores,
  disciplinas,
}: TurmaContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalDisciplinasOpen, setIsModalDisciplinasOpen] = useState(false);
  const [isModalAtribuirProfessorOpen, setIsModalAtribuirProfessorOpen] = useState(false);
  const [isModalConfirmarExclusaoOpen, setIsModalConfirmarExclusaoOpen] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<{ id: string; nome: string } | null>(null);
  const [disciplinasTurma, setDisciplinasTurma] = useState<DisciplinaTurma[]>(turma.disciplinas);

  // Filtra as disciplinas que já estão na turma
  const disciplinasDisponiveis = disciplinas.filter(
    (disciplina) => !disciplinasTurma.some((d) => d.id === disciplina.id)
  );

  const handleAdicionarDisciplinas = async (disciplinas: Array<{ disciplinaId: string; professorId?: string }>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      let novasDisciplinas: DisciplinaTurma[] = [];
      for (const item of disciplinas) {
        const response = await fetch(`/api/gestor/turmas/${turma.id}/disciplinas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Erro ao adicionar disciplinas");
        }
        const data = await response.json();
        novasDisciplinas.push({
          id: item.disciplinaId,
          nome: disciplinas.find((d) => d.id === item.disciplinaId)?.nome || "",
          professor: data.professor
            ? { id: data.professor.id, nome: data.professor.nome }
            : null,
        });
      }
      setDisciplinasTurma((prev) => [...prev, ...novasDisciplinas]);
      setSuccess("Disciplinas adicionadas com sucesso!");
      setIsModalDisciplinasOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar disciplinas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtribuirProfessor = async (professorId: string) => {
    if (!disciplinaSelecionada) return;
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(`/api/gestor/turmas/${turma.id}/disciplinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disciplinaId: disciplinaSelecionada.id,
          professorId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao atribuir professor à disciplina");
      }
      const data = await response.json();
      setDisciplinasTurma((prev) =>
        prev.map((d) =>
          d.id === disciplinaSelecionada.id
            ? {
                ...d,
                professor: data.professor
                  ? { id: data.professor.id, nome: data.professor.nome }
                  : null,
              }
            : d
        )
      );
      setSuccess(`Professor atribuído com sucesso à disciplina ${disciplinaSelecionada.nome}!`);
      setIsModalAtribuirProfessorOpen(false);
      setDisciplinaSelecionada(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atribuir professor à disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoverDisciplina = async () => {
    if (!disciplinaSelecionada) return;
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(
        `/api/gestor/turmas/${turma.id}/disciplinas/${disciplinaSelecionada.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao remover disciplina");
      }
      setDisciplinasTurma((prev) => prev.filter((d) => d.id !== disciplinaSelecionada.id));
      setSuccess("Disciplina removida com sucesso!");
      setIsModalConfirmarExclusaoOpen(false);
      setDisciplinaSelecionada(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAtribuirProfessorModal = (disciplinaId: string, disciplinaNome: string) => {
    setDisciplinaSelecionada({ id: disciplinaId, nome: disciplinaNome });
    setIsModalAtribuirProfessorOpen(true);
  };

  const openConfirmarExclusaoModal = (disciplinaId: string, disciplinaNome: string) => {
    setDisciplinaSelecionada({ id: disciplinaId, nome: disciplinaNome });
    setIsModalConfirmarExclusaoOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <TurmaHeader
            turmaId={turma.id}
            nome={turma.nome}
            escolaNome={turma.escolaNome || ""}
            escolaId={turma.escolaId}
            totalAlunos={turma._count.alunos}
            totalProfessores={turma._count.professores}
            onOpenModalDisciplinas={() => setIsModalDisciplinasOpen(true)}
            onOpenModalExcluir={() => {}}
          />

          {error && (
            <Alert variant="error" className="rounded-lg">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="rounded-lg">
              {success}
            </Alert>
          )}

          <TabelaDisciplinas
            disciplinas={disciplinasTurma}
            onAtribuirProfessor={openAtribuirProfessorModal}
            onRemoverDisciplina={openConfirmarExclusaoModal}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <ModalDisciplinas
        isOpen={isModalDisciplinasOpen}
        onClose={() => setIsModalDisciplinasOpen(false)}
        disciplinasDisponiveis={disciplinasDisponiveis}
        professores={professores}
        onSubmit={handleAdicionarDisciplinas}
        isSubmitting={isSubmitting}
      />

      <ModalAtribuirProfessor
        isOpen={isModalAtribuirProfessorOpen}
        onClose={() => {
          setIsModalAtribuirProfessorOpen(false);
          setDisciplinaSelecionada(null);
        }}
        disciplinaNome={disciplinaSelecionada?.nome || ""}
        professores={professores}
        onSubmit={handleAtribuirProfessor}
        isSubmitting={isSubmitting}
      />

      <ModalConfirmarExclusao
        isOpen={isModalConfirmarExclusaoOpen}
        onClose={() => {
          setIsModalConfirmarExclusaoOpen(false);
          setDisciplinaSelecionada(null);
        }}
        disciplinaNome={disciplinaSelecionada?.nome || ""}
        onConfirm={handleRemoverDisciplina}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 