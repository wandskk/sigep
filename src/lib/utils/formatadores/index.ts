export * from "../cpf";
export * from "../telefone";
export * from "../email";
export * from "../parentesco";

export function formatarCPF(cpf: string | null): string {
  if (!cpf) return "Não informado";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarTelefone(telefone: string | null): string {
  if (!telefone) return "Não informado";
  return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function formatarEmail(email: string | null): string {
  if (!email) return "Não informado";
  return email.toLowerCase();
}

export function formatarData(data: Date): string {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function formatarParentesco(parentesco: string): string {
  const parentescos: Record<string, string> = {
    PAI: "Pai",
    MAE: "Mãe",
    AVO: "Avó/Avô",
    TIO: "Tio/Tia",
    IRMAO: "Irmão/Irmã",
    OUTRO: "Outro"
  };
  return parentescos[parentesco] || parentesco;
} 