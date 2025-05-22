import { UserRole } from "@prisma/client";

/**
 * Tipos relacionados à autenticação
 */

/**
 * Parâmetros para criar um novo usuário
 */
export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Resultado das operações de autenticação
 */
export interface AuthResult {
  success: boolean;
  message?: string;
  user?: Record<string, unknown>;
}

/**
 * Parâmetros para login de usuário
 */
export interface LoginParams {
  email: string;
  password: string;
}

/**
 * Parâmetros para redefinição de senha
 */
export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

/**
 * Dados do token de redefinição de senha
 */
export interface PasswordResetToken {
  email: string;
  token: string;
  expires: Date;
} 