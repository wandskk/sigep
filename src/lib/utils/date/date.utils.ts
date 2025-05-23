/**
 * Formata uma data para exibição no formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada no padrão DD/MM/YYYY
 */
export function formatarDataBR(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data para exibição no formato brasileiro com hora
 * @param date Data a ser formatada
 * @returns String formatada no padrão DD/MM/YYYY HH:MM
 */
export function formatarDataHoraBR(date: Date): string {
  return date.toLocaleString('pt-BR');
}

/**
 * Converte uma string em formato brasileiro para um objeto Date
 * @param dateStr String no formato DD/MM/YYYY
 * @returns Objeto Date ou null se a entrada for inválida
 */
export function parseDateBR(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês em JS começa em 0
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
}

/**
 * Calcula a idade baseada na data de nascimento
 * @param birthDate Data de nascimento
 * @returns Idade em anos
 */
export function calcularIdade(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Verifica se uma data está no futuro
 * @param date Data a ser verificada
 * @returns true se a data estiver no futuro
 */
export function isDataFutura(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date > today;
}

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Quantidade de dias a adicionar
 * @returns Nova data com os dias adicionados
 */
export function adicionarDias(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formata data para padrão ISO para uso em campos de input
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export function formatarDataISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
} 