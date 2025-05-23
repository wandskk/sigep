export function formatarCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, "");

  // Verifica se o CPF tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return cpf;
  }

  // Formata o CPF (XXX.XXX.XXX-XX)
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
} 