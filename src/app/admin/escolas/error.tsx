"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function SchoolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página de escolas:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Alert variant="error" className="mb-6">
            <p className="font-medium">Ocorreu um erro ao carregar as escolas</p>
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
        </div>
      </div>
    </div>
  );
} 