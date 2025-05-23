import { Parentesco } from "@prisma/client";

export function formatarParentesco(parentesco: Parentesco): string {
  const formatacoes: Record<Parentesco, string> = {
    MAE: "Mãe",
    PAI: "Pai",
    AVO: "Avó/Avô",
    OUTRO: "Outro"
  };

  return formatacoes[parentesco] || parentesco;
} 