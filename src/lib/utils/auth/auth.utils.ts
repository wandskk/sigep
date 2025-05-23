import { hash, compare } from "bcryptjs";
import crypto from "crypto";

/**
 * Utilitários relacionados à autenticação
 */

/**
 * Gera um hash seguro para senha
 * @param password Senha em texto puro
 * @returns Senha com hash
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

/**
 * Compara uma senha em texto puro com seu hash
 * @param password Senha em texto puro
 * @param hashedPassword Senha com hash armazenada
 * @returns Verdadeiro se as senhas corresponderem
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

/**
 * Gera um token seguro para redefinição de senha
 * @returns Token UUID
 */
export function generateSecureToken(): string {
  return crypto.randomUUID();
}

/**
 * Calcula data de expiração para um token
 * @param hoursValid Número de horas de validade
 * @returns Data de expiração
 */
export function calculateTokenExpiry(hoursValid: number = 24): Date {
  return new Date(Date.now() + hoursValid * 60 * 60 * 1000);
} 