import { UserRole } from "@prisma/client";
import { ROLE_REDIRECT_PATHS } from "../constants/auth";

/**
 * Helpers para autenticação
 */

/**
 * Determina o caminho de redirecionamento após login, baseado no perfil do usuário
 * @param role Perfil do usuário
 * @param defaultPath Caminho padrão caso não haja mapeamento para o perfil
 * @returns Caminho para redirecionamento
 */
export function getRedirectPathByRole(role: UserRole, defaultPath: string = "/dashboard"): string {
  return ROLE_REDIRECT_PATHS[role] || defaultPath;
}

/**
 * Verifica se um usuário tem acesso a uma determinada rota baseado em seu perfil
 * @param userRole Perfil do usuário
 * @param allowedRoles Lista de perfis permitidos para acesso
 * @returns True se o usuário tem permissão
 */
export function hasPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  // Administradores têm acesso a tudo
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  
  return allowedRoles.includes(userRole);
}

/**
 * Cria uma mensagem de boas-vindas personalizada baseada no perfil do usuário
 * @param name Nome do usuário
 * @param role Perfil do usuário
 * @returns Mensagem personalizada
 */
export function createWelcomeMessage(name: string, role: UserRole): string {
  const roleName = role.charAt(0) + role.slice(1).toLowerCase();
  return `Bem-vindo, ${roleName} ${name}!`;
} 