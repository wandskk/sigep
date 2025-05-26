"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/layout/Container";

export default function ProfessoresError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página de professores:", error);
  }, [error]);

  return (
    <Container>
      <Alert variant="error" className="mb-6">
        <p className="font-medium">Ocorreu um erro ao carregar os professores</p>
        <p className="mt-1 text-sm">
          {error.message || "Tente novamente mais tarde"}
        </p>
      </Alert>

      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={() => reset()}
        >
          Tentar novamente
        </Button>
      </div>
    </Container>
  );
} 