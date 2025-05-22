import { UserRole } from "@prisma/client";

/**
 * Constantes relacionadas à autenticação
 */

/**
 * Duração padrão da sessão (em dias)
 */
export const DEFAULT_SESSION_DURATION = 30;

/**
 * Expiração padrão do token de redefinição de senha (em horas)
 */
export const PASSWORD_RESET_TOKEN_EXPIRY = 24;

/**
 * Mapeamento de perfis para nomes legíveis
 */
export const ROLE_DISPLAY_NAMES = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.ALUNO]: "Aluno",
  [UserRole.PROFESSOR]: "Professor",
  [UserRole.GESTOR]: "Gestor",
  [UserRole.SECRETARIA]: "Secretaria",
};

/**
 * Mapeamento de perfis para caminhos de redirecionamento
 */
export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "/admin",
  [UserRole.GESTOR]: "/gestor",
  [UserRole.SECRETARIA]: "/secretaria",
  [UserRole.PROFESSOR]: "/professor",
  [UserRole.ALUNO]: "/aluno",
};

/**
 * Tamanho mínimo para senhas
 */
export const MIN_PASSWORD_LENGTH = 8; 