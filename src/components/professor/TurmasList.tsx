'use client';

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, BookOpen, Users, GraduationCap } from "lucide-react";
import { TurnoFilter } from "./TurnoFilter";
import { Turma } from "@/types/turma";

interface TurmasListProps {
  turmas: Turma[];
}

export function TurmasList({ turmas }: TurmasListProps) {
  const [selectedTurno, setSelectedTurno] = useState("TODOS");

  const turmasFiltradas = selectedTurno === "TODOS"
    ? turmas
    : turmas.filter(turma => turma.turno === selectedTurno);

  return (
    <Card>
      <CardHeader className="border-b border-gray-100/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            Todas as Turmas
          </CardTitle>
          <div className="flex items-center gap-4">
            <TurnoFilter 
              defaultValue={selectedTurno} 
              onTurnoChange={setSelectedTurno} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmasFiltradas.length > 0 ? (
            turmasFiltradas.map((turma) => (
              <Link
                key={turma.id}
                href={`/professor/turmas/${turma.id}`}
                className="block group cursor-pointer relative w-full text-left"
              >
                <div className="h-full bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all duration-300 shadow-sm hover:shadow-md p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        turma.turno === "MATUTINO"
                          ? "bg-amber-100 text-amber-800 group-hover:bg-amber-200"
                          : turma.turno === "VESPERTINO"
                          ? "bg-orange-100 text-orange-800 group-hover:bg-orange-200"
                          : "bg-blue-100 text-blue-800 group-hover:bg-blue-200"
                      } transition-colors`}>
                        {turma.turno === "MATUTINO"
                          ? "Matutino"
                          : turma.turno === "VESPERTINO"
                          ? "Vespertino"
                          : "Noturno"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg mb-3">
                      {turma.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {turma.escola.name}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-blue-600" />
                            {turma.totalAlunos}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-emerald-600" />
                            {turma.disciplinas.length}
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-blue-600 group-hover:text-blue-800">
                          Gerenciar
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <AlertCircle className="w-5 h-5" />
                  <p>Nenhuma turma encontrada para o turno selecionado</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 