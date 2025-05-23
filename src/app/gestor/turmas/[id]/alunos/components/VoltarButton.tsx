"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface VoltarButtonProps {
  turmaId: string;
}

export function VoltarButton({ turmaId }: VoltarButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/gestor/turmas/${turmaId}`)}
      variant="outline"
      className="flex items-center gap-2 mb-4"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      Voltar
    </Button>
  );
} 