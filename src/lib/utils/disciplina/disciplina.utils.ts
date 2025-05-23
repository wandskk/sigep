import { Disciplina } from "@prisma/client";

/**
 * Gera um código de disciplina padronizado
 * @param nome Nome da disciplina
 * @param prefixo Prefixo opcional para o código
 * @returns Código gerado para a disciplina
 */
export function gerarCodigoDisciplina(nome: string, prefixo: string = 'DISC'): string {
  if (!nome) return '';
  
  // Pega as 3 primeiras letras do nome e converte para maiúsculas
  const abreviacao = nome.substring(0, 3).toUpperCase();
  
  // Gera um número aleatório de 3 dígitos
  const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
  
  return `${prefixo}-${abreviacao}-${numeroAleatorio}`;
}

/**
 * Formata o código da disciplina para exibição
 * @param codigo Código da disciplina
 * @returns Código formatado para exibição
 */
export function formatarCodigoDisciplina(codigo: string): string {
  if (!codigo) return '';
  
  // Supondo que o código tenha o formato "PREFIXO-ABREV-NUMERO"
  const parts = codigo.split('-');
  if (parts.length !== 3) return codigo;
  
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

/**
 * Formata disciplina para exibição em componentes
 * @param disciplina Dados da disciplina
 * @returns Objeto formatado para exibição
 */
export function formatarDisciplinaParaExibicao(disciplina: any): Record<string, string> {
  return {
    id: disciplina.id,
    nome: disciplina.nome,
    codigo: disciplina.codigo,
    codigoFormatado: formatarCodigoDisciplina(disciplina.codigo),
    professor: disciplina.professor?.nome || 'Não atribuído'
  };
}

/**
 * Cria uma representação simplificada da disciplina
 * @param disciplina Objeto com dados da disciplina
 * @returns Representação simplificada (id, nome, codigo)
 */
export function criarDisciplinaSimples(disciplina: any): { id: string; nome: string; codigo: string } {
  return {
    id: disciplina.id,
    nome: disciplina.nome,
    codigo: disciplina.codigo
  };
} 