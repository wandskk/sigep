import { MIN_PASSWORD_LENGTH } from "../../constants/auth";

/**
 * Validadores para senha
 */

/**
 * Verifica se a senha atende aos requisitos mínimos
 * @param password Senha a ser validada
 * @returns Objeto com resultado da validação e mensagem de erro
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password) {
    return { isValid: false, message: "A senha é obrigatória" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` 
    };
  }

  // Verifica se a senha contém pelo menos um número
  if (!/\d/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos um número" };
  }

  // Verifica se a senha contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos uma letra maiúscula" };
  }

  // Verifica se a senha contém pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos um caractere especial" };
  }

  return { isValid: true };
}

/**
 * Verifica se as senhas conferem
 * @param password Senha original
 * @param confirmPassword Confirmação da senha
 * @returns Objeto com resultado da validação e mensagem de erro
 */
export function validatePasswordConfirmation(
  password: string, 
  confirmPassword: string
): { isValid: boolean; message?: string } {
  if (password !== confirmPassword) {
    return { isValid: false, message: "As senhas não conferem" };
  }

  return { isValid: true };
} 