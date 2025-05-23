/**
 * Formata um número para exibição como moeda brasileira
 * @param value Valor a ser formatado
 * @param showCurrency Inclui o símbolo da moeda (R$)
 * @returns String formatada
 */
export function formatarMoedaBR(value: number, showCurrency: boolean = true): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(value);
}

/**
 * Converte uma string de moeda brasileira para número
 * @param valueStr String no formato brasileiro (ex: "R$ 1.234,56")
 * @returns Valor numérico ou null se inválido
 */
export function parseMoedaBR(valueStr: string): number | null {
  if (!valueStr) return null;
  
  // Remove símbolo de moeda e separadores
  const cleanValue = valueStr
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  
  const result = parseFloat(cleanValue);
  return isNaN(result) ? null : result;
}

/**
 * Formata um número com separador de milhares
 * @param value Valor a ser formatado
 * @param decimalPlaces Quantidade de casas decimais
 * @returns String formatada
 */
export function formatarNumero(value: number, decimalPlaces: number = 0): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
  
  return formatter.format(value);
}

/**
 * Verifica se um número está dentro de um intervalo especificado
 * @param value Valor a ser verificado
 * @param min Valor mínimo (inclusivo)
 * @param max Valor máximo (inclusivo)
 * @returns true se o valor estiver dentro do intervalo
 */
export function isNumeroNoIntervalo(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Calcula a média de um array de números
 * @param values Array de valores numéricos
 * @returns Média dos valores ou zero se o array estiver vazio
 */
export function calcularMedia(values: number[]): number {
  if (!values || values.length === 0) return 0;
  
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

/**
 * Arredonda um número para o número de casas decimais especificado
 * @param value Valor a ser arredondado
 * @param decimalPlaces Número de casas decimais
 * @returns Número arredondado
 */
export function arredondar(value: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

/**
 * Converte uma nota numérica para um conceito
 * @param nota Nota (0 a 10)
 * @returns Conceito (A, B, C, D, E)
 */
export function notaParaConceito(nota: number): string {
  if (nota >= 9) return 'A';
  if (nota >= 7) return 'B';
  if (nota >= 5) return 'C';
  if (nota >= 3) return 'D';
  return 'E';
} 