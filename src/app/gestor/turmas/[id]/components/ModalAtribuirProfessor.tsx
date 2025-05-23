"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

interface Professor {
  id: string;
  nome: string;
}

interface ModalAtribuirProfessorProps {
  isOpen: boolean;
  onClose: () => void;
  disciplinaNome: string;
  professores: Professor[];
  onSubmit: (professorId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ModalAtribuirProfessor({
  isOpen,
  onClose,
  disciplinaNome,
  professores,
  onSubmit,
  isSubmitting,
}: ModalAtribuirProfessorProps) {
  const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(null);
  const [professorQuery, setProfessorQuery] = useState("");

  const filteredProfessores =
    professorQuery === ""
      ? professores
      : professores.filter((professor) =>
          professor.nome.toLowerCase().includes(professorQuery.toLowerCase())
        );

  const handleSubmit = async () => {
    if (!professorSelecionado) return;
    await onSubmit(professorSelecionado.id);
    setProfessorSelecionado(null);
    setProfessorQuery("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => !isSubmitting && onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium text-[#374151] mb-4">
                Atribuir Professor à Disciplina
              </Dialog.Title>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Disciplina:</p>
                <p className="font-medium">{disciplinaNome}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione um Professor:
                </label>
                <Combobox value={professorSelecionado} onChange={setProfessorSelecionado}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 focus-within:border-[#1E3A8A] focus-within:ring-1 focus-within:ring-[#1E3A8A]">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none focus:ring-0"
                        displayValue={(professor: Professor) => professor?.nome || ""}
                        onChange={(event) => setProfessorQuery(event.target.value)}
                        placeholder="Buscar professor..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setProfessorQuery("")}
                    >
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredProfessores.length === 0 && professorQuery !== "" ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                            Nenhum professor encontrado.
                          </div>
                        ) : (
                          filteredProfessores.map((professor) => (
                            <Combobox.Option
                              key={professor.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? "bg-[#1E3A8A] text-white" : "text-gray-900"
                                }`
                              }
                              value={professor}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {professor.nome}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? "text-white" : "text-[#1E3A8A]"
                                      }`}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !professorSelecionado}
                >
                  {isSubmitting ? "Atribuindo..." : "Atribuir Professor"}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 