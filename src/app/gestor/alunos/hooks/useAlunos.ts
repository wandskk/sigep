import { useState, useEffect } from 'react';
import { AlunoFormatado } from '@/components/tables/TabelaAlunos';

export const useAlunos = () => {
  const [alunos, setAlunos] = useState<AlunoFormatado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escolaId, setEscolaId] = useState<string | null>(null);

  const fetchEscolaId = async () => {
    try {
      const response = await fetch("/api/gestor/escola");
      if (!response.ok) {
        throw new Error("Erro ao carregar escola");
      }
      const data = await response.json();
      setEscolaId(data.id);
    } catch (err) {
      setError("Erro ao carregar escola");
      console.error(err);
    }
  };

  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/gestor/alunos");
      if (!response.ok) {
        throw new Error("Erro ao carregar alunos");
      }
      const data = await response.json();
      setAlunos(data);
    } catch (err) {
      setError("Erro ao carregar alunos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refetchAlunos = () => {
    setLoading(true);
    fetchAlunos();
  };

  return {
    alunos,
    loading,
    error,
    escolaId,
    fetchEscolaId,
    fetchAlunos,
    refetchAlunos,
  };
}; 