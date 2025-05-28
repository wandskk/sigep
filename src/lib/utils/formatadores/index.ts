export * from "../cpf";
export * from "../telefone";
export * from "../email";
export * from "../parentesco";

export function formatarCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, "");
  
  // Aplica a máscara
  return cpfLimpo
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatarTelefone(telefone: string): string {
  // Remove caracteres não numéricos
  const telefoneLimpo = telefone.replace(/\D/g, "");
  
  // Aplica a máscara
  if (telefoneLimpo.length <= 10) {
    return telefoneLimpo
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return telefoneLimpo
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
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