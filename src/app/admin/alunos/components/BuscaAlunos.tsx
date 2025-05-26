"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export function BuscaAlunos() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar alunos por nome, email, escola ou turma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
} 