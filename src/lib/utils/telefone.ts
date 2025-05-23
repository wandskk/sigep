export function formatarTelefone(telefone: string): string {
  // Remove caracteres não numéricos
  const telefoneLimpo = telefone.replace(/\D/g, "");

  // Verifica se o telefone tem 10 ou 11 dígitos (com DDD)
  if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
    return telefone;
  }

  // Formata o telefone (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
} 