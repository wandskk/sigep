export function formatarEmail(email: string | null): string {
  if (!email) {
    return "Não informado";
  }
  return email.toLowerCase();
} 