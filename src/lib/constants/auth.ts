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
 * Mapeamento de perfis para suas rotas de redirecionamento após login
 */
export const ROLE_REDIRECT_PATHS = {
  [UserRole.ADMIN]: "/admin",
  [UserRole.ALUNO]: "/dashboard",
  [UserRole.PROFESSOR]: "/turmas",
  [UserRole.GESTOR]: "/escolas",
  [UserRole.SECRETARIA]: "/escolas",
};

/**
 * Tamanho mínimo para senhas
 */
export const MIN_PASSWORD_LENGTH = 8; 