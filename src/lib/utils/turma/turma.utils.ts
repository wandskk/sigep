import { Turma, Turno } from "@prisma/client";

/**
 * Obtém o texto para exibição do turno
 * @param turno Enumeração do turno
 * @returns Texto formatado para exibição
 */
export function getTurnoTexto(turno: Turno): string {
  switch (turno) {
    case 'MATUTINO':
      return "Matutino";
    case 'VESPERTINO':
      return "Vespertino";
    case 'NOTURNO':
      return "Noturno";
    default:
      return "Indefinido";
  }
}

/**
 * Formata o código da turma para exibição
 * @param codigo Código da turma
 * @returns Código formatado para exibição
 */
export function formatarCodigoTurma(codigo: string): string {
  if (!codigo) return '';
  
  // Supondo que o código tenha o formato "ANO-SERIE-TURMA"
  const parts = codigo.split('-');
  if (parts.length !== 3) return codigo;
  
  return `${parts[0]} · ${parts[1]}º Ano · Turma ${parts[2]}`;
}

/**
 * Gera um nome resumido para a turma
 * @param nome Nome completo da turma
 * @param maxLength Tamanho máximo desejado
 * @returns Nome resumido para exibição em listas
 */
export function getNomeResumido(nome: string, maxLength: number = 20): string {
  if (!nome) return '';
  if (nome.length <= maxLength) return nome;
  
  return `${nome.substring(0, maxLength)}...`;
}

/**
 * Formata turma para exibição em componentes
 * @param turma Dados da turma
 * @returns Objeto formatado para exibição
 */
export function formatarTurmaParaExibicao(turma: any): Record<string, string | number> {
  return {
    id: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    codigoFormatado: formatarCodigoTurma(turma.codigo),
    turno: getTurnoTexto(turma.turno),
    totalAlunos: turma._count?.alunos || 0,
    totalProfessores: turma._count?.professores || 0
  };
}