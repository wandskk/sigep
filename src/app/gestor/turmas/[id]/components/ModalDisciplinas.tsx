"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/Button";

interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
}

interface Professor {
  id: string;
  nome: string;
}

interface DisciplinaSelecionada {
  id: string;
  nome: string;
  selecionada: boolean;
  professorId: string;
}

interface ModalDisciplinasProps {
  isOpen: boolean;
  onClose: () => void;
  disciplinasDisponiveis: Disciplina[];
  professores: Professor[];
  onSubmit: (disciplinas: Array<{ disciplinaId: string; professorId?: string }>) => Promise<void>;
  isSubmitting: boolean;
}

export function ModalDisciplinas({
  isOpen,
  onClose,
  disciplinasDisponiveis,
  professores,
  onSubmit,
  isSubmitting,
}: ModalDisciplinasProps) {
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<DisciplinaSelecionada[]>(
    disciplinasDisponiveis.map((disciplina) => ({
      id: disciplina.id,
      nome: disciplina.nome,
      selecionada: false,
      professorId: "",
    }))
  );
  const [selecionarTodas, setSelecionarTodas] = useState(false);
  const [professorPadrao, setProfessorPadrao] = useState("");

  const handleDisciplinaChange = (disciplinaId: string, checked: boolean) => {
    const novasSelecionadas = disciplinasSelecionadas.map((d) =>
      d.id === disciplinaId ? { ...d, selecionada: checked } : d
    );
    setDisciplinasSelecionadas(novasSelecionadas);
    setSelecionarTodas(novasSelecionadas.every((d) => d.selecionada));
  };

  const handleSelecionarTodas = (checked: boolean) => {
    setSelecionarTodas(checked);
    setDisciplinasSelecionadas(
      disciplinasSelecionadas.map((d) => ({
        ...d,
        selecionada: checked,
      }))
    );
  };

  const handleProfessorChange = (disciplinaId: string, professorId: string) => {
    setDisciplinasSelecionadas(
      disciplinasSelecionadas.map((d) =>
        d.id === disciplinaId ? { ...d, professorId } : d
      )
    );
  };

  const handleProfessorPadraoChange = (professorId: string) => {
    setProfessorPadrao(professorId);
    if (professorId) {
      setDisciplinasSelecionadas(
        disciplinasSelecionadas.map((d) =>
          d.selecionada ? { ...d, professorId } : d
        )
      );
    }
  };

  const handleSubmit = async () => {
    const disciplinasParaAdicionar = disciplinasSelecionadas
      .filter((d) => d.selecionada)
      .map((d) => ({
        disciplinaId: d.id,
        professorId: d.professorId || undefined,
      }));

    await onSubmit(disciplinasParaAdicionar);
    
    // Resetar o estado após o envio
    setDisciplinasSelecionadas(
      disciplinasSelecionadas.map((d) => ({
        ...d,
        selecionada: false,
        professorId: "",
      }))
    );
    setSelecionarTodas(false);
    setProfessorPadrao("");
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
          setSelecionarTodas(false);
          setProfessorPadrao("");
        }
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
            Adicionar Disciplinas
          </Dialog.Title>

          <div className="space-y-4">
            {disciplinasDisponiveis.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Não há disciplinas disponíveis para adicionar.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Selecione as disciplinas e atribua um professor para cada uma.
                  </p>
                  <div className="flex items-center">
                    <input
                      id="selecionar-todas"
                      type="checkbox"
                      className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded mr-2"
                      checked={selecionarTodas}
                      onChange={(e) => handleSelecionarTodas(e.target.checked)}
                    />
                    <label
                      htmlFor="selecionar-todas"
                      className="text-sm font-medium text-gray-700"
                    >
                      Selecionar Todas
                    </label>
                  </div>
                </div>

                {disciplinasSelecionadas.some((d) => d.selecionada) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label
                        htmlFor="professor-padrao"
                        className="text-sm font-medium text-gray-700 whitespace-nowrap"
                      >
                        Definir professor para todas:
                      </label>
                      <div className="flex-1">
                        <select
                          id="professor-padrao"
                          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                          value={professorPadrao}
                          onChange={(e) => handleProfessorPadraoChange(e.target.value)}
                        >
                          <option value="">Selecionar professor</option>
                          {professores.map((professor) => (
                            <option key={professor.id} value={professor.id}>
                              {professor.nome}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 italic">
                          Atribuir professor é opcional. Você pode adicionar disciplinas sem
                          professores e atribuí-los posteriormente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disciplinasDisponiveis.map((disciplina) => (
                    <div key={disciplina.id} className="border rounded-md p-3">
                      <div className="flex items-start mb-2">
                        <div className="flex items-center h-5">
                          <input
                            id={`disciplina-${disciplina.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded"
                            checked={
                              disciplinasSelecionadas.find(
                                (d) => d.id === disciplina.id
                              )?.selecionada || false
                            }
                            onChange={(e) =>
                              handleDisciplinaChange(disciplina.id, e.target.checked)
                            }
                          />
                        </div>
                        <label
                          htmlFor={`disciplina-${disciplina.id}`}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {disciplina.nome}
                        </label>
                      </div>

                      {disciplinasSelecionadas.find(
                        (d) => d.id === disciplina.id
                      )?.selecionada && (
                        <div className="pl-7">
                          <label
                            htmlFor={`professor-${disciplina.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Professor (opcional):
                          </label>
                          <select
                            id={`professor-${disciplina.id}`}
                            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm"
                            value={
                              disciplinasSelecionadas.find(
                                (d) => d.id === disciplina.id
                              )?.professorId || ""
                            }
                            onChange={(e) =>
                              handleProfessorChange(disciplina.id, e.target.value)
                            }
                          >
                            <option value="">Sem professor</option>
                            {professores.map((professor) => (
                              <option key={professor.id} value={professor.id}>
                                {professor.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="minimal-ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="minimal"
                size="sm"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !disciplinasSelecionadas.some((d) => d.selecionada)
                }
              >
                {isSubmitting ? "Adicionando..." : "Adicionar Selecionadas"}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 