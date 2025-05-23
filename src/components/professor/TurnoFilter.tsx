'use client';

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface TurnoFilterProps {
  defaultValue: string;
  onTurnoChange: (turno: string) => void;
}

export function TurnoFilter({ defaultValue, onTurnoChange }: TurnoFilterProps) {
  const [selectedTurno, setSelectedTurno] = useState(defaultValue);

  useEffect(() => {
    onTurnoChange(selectedTurno);
  }, [selectedTurno, onTurnoChange]);

  return (
    <Select 
      value={selectedTurno}
      onValueChange={setSelectedTurno}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por turno" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="TODOS">Todos os turnos</SelectItem>
        <SelectItem value="MATUTINO">Matutino</SelectItem>
        <SelectItem value="VESPERTINO">Vespertino</SelectItem>
        <SelectItem value="NOTURNO">Noturno</SelectItem>
      </SelectContent>
    </Select>
  );
} 