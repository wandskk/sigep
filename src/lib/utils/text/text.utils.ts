/**
 * Remove acentos de uma string
 * @param text Texto para remover acentos
 * @returns Texto sem acentos
 */
export function removerAcentos(text: string): string {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Capitaliza a primeira letra de cada palavra em uma string
 * @param text Texto para capitalizar
 * @returns Texto com primeira letra de cada palavra maiúscula
 */
export function capitalizarPalavras(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Trunca um texto para o comprimento máximo especificado
 * @param text Texto para truncar
 * @param maxLength Comprimento máximo
 * @param useEllipsis Indica se deve adicionar reticências
 * @returns Texto truncado
 */
export function truncarTexto(text: string, maxLength: number, useEllipsis: boolean = true): string {
  if (!text || text.length <= maxLength) return text || '';
  
  const truncated = text.substring(0, maxLength);
  return useEllipsis ? `${truncated}...` : truncated;
}

/**
 * Formata um CPF para exibição no formato XXX.XXX.XXX-XX
 * @param cpf String de CPF (apenas números)
 * @returns CPF formatado
 */
export function formatarCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove tudo que não for número
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se possui o comprimento esperado
  if (cleanCPF.length !== 11) return cpf;
  
  // Formata no padrão XXX.XXX.XXX-XX
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um CEP para exibição no formato XXXXX-XXX
 * @param cep String de CEP (apenas números)
 * @returns CEP formatado
 */
export function formatarCEP(cep: string): string {
  if (!cep) return '';
  
  // Remove tudo que não for número
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se possui o comprimento esperado
  if (cleanCEP.length !== 8) return cep;
  
  // Formata no padrão XXXXX-XXX
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata um número de telefone
 * @param telefone String de telefone (apenas números)
 * @returns Telefone formatado
 */
export function formatarTelefone(telefone: string): string {
  if (!telefone) return '';
  
  // Remove tudo que não for número
  const cleanPhone = telefone.replace(/\D/g, '');
  
  // Verifica o comprimento para determinar se é celular ou fixo
  if (cleanPhone.length === 11) {
    // Celular com DDD: (XX) 9XXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2$3-$4');
  } else if (cleanPhone.length === 10) {
    // Fixo com DDD: (XX) XXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Retorna sem formatação se não se encaixar nos padrões
  return telefone;
}

/**
 * Gera um slug a partir de um texto
 * @param text Texto base para o slug
 * @returns Slug gerado (texto em lowercase, sem acentos, com hífens)
 */
export function gerarSlug(text: string): string {
  if (!text) return '';
  
  return removerAcentos(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais exceto hífen
    .replace(/[\s_-]+/g, '-') // Substitui espaços, underlines e hífens por um único hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
} 