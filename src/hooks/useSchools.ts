import { useState } from "react";
import { School, CreateSchoolFormData } from "@/types/school";

interface UseSchoolsProps {
  initialSchools: School[];
}

export function useSchools({ initialSchools }: UseSchoolsProps) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const createSchool = async (data: CreateSchoolFormData) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar escola");
      }

      const newSchool = await response.json();
      setSchools((prevSchools) => [...prevSchools, newSchool]);
      setSuccess("Escola criada com sucesso!");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar escola");
      return false;
    }
  };

  const updateSchool = async (schoolId: string, data: CreateSchoolFormData) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar escola");
      }

      const updatedSchool = await response.json();
      setSchools((prevSchools) =>
        prevSchools.map((school) =>
          school.id === schoolId ? updatedSchool : school
        )
      );
      setSuccess("Escola atualizada com sucesso!");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar escola");
      return false;
    }
  };

  const deleteSchool = async (schoolId: string) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir escola");
      }

      setSchools((prevSchools) =>
        prevSchools.filter((school) => school.id !== schoolId)
      );
      setSuccess("Escola excluída com sucesso!");
      return true;
    } catch (err) {
      setError("Não foi possível excluir a escola");
      console.error("Erro ao excluir escola:", err);
      return false;
    }
  };

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    schools: filteredSchools,
    error,
    success,
    searchTerm,
    setSearchTerm,
    createSchool,
    updateSchool,
    deleteSchool,
    setError,
    setSuccess,
  };
} 