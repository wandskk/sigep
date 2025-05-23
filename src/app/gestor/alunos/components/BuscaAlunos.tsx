"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";

export function BuscaAlunos() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mb-6">
      <Input
        type="text"
        placeholder="Buscar por nome, matrícula ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md"
      />
    </div>
  );
} 