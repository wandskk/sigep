import { Aluno, Sexo, Situacao } from "@prisma/client";
import { formatarDataBR } from "../date/date.utils";
import { calcularIdade } from "../date/date.utils";
import { formatarCPF, formatarTelefone } from "../text/text.utils";

/**
 * Formata o nome completo do aluno
 * @param nome Nome do aluno
 * @param sobrenome Sobrenome do aluno
 * @returns Nome completo formatado
 */
export function formatarNomeCompleto(nome: string, sobrenome?: string): string {
  if (!sobrenome) return nome;
  return `${nome} ${sobrenome}`;
}

/**
 * Obtém o texto para exibição do gênero do aluno
 * @param sexo Enumeração do gênero
 * @returns Texto formatado para exibição
 */
export function getSexoTexto(sexo: Sexo): string {
  switch (sexo) {
    case Sexo.MASCULINO:
      return "Masculino";
    case Sexo.FEMININO:
      return "Feminino";
    default:
      return "Não informado";
  }
}

/**
 * Obtém o texto para exibição da situação do aluno
 * @param situacao Enumeração da situação
 * @returns Texto formatado para exibição
 */
export function getSituacaoTexto(situacao: Situacao): string {
  switch (situacao) {
    case Situacao.ATIVO:
      return "Ativo";
    case Situacao.INATIVO:
      return "Inativo";
    case Situacao.TRANSFERIDO:
      return "Transferido";
    case Situacao.TRANCADO:
      return "Trancado";
    default:
      return "Desconhecido";
  }
}

/**
 * Formata informações básicas do aluno para exibição em listagem
 * @param aluno Objeto com dados do aluno
 * @returns Objeto formatado para exibição
 */
export function formatarAlunoParaExibicao(aluno: any): Record<string, string> {
  return {
    id: aluno.id,
    nome: aluno.user?.name || 'Nome não informado',
    matricula: aluno.matricula,
    dataNascimento: formatarDataBR(aluno.dataNascimento),
    idade: calcularIdade(aluno.dataNascimento).toString(),
    sexo: getSexoTexto(aluno.sexo),
    cpf: aluno.cpf ? formatarCPF(aluno.cpf) : 'Não informado',
    telefone: aluno.telefone ? formatarTelefone(aluno.telefone) : 'Não informado',
    situacao: getSituacaoTexto(aluno.situacao)
  };
} 