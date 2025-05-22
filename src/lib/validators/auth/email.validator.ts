/**
 * Validadores para email
 */

/**
 * Regex para validação básica de email
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Verifica se o email é válido
 * @param email Email a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: "O email é obrigatório" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Formato de email inválido" };
  }

  return { isValid: true };
}

/**
 * Verifica se o email tem um domínio válido
 * @param email Email a ser validado
 * @param allowedDomains Lista de domínios permitidos
 * @returns Objeto com resultado da validação e mensagem de erro
 */
export function validateEmailDomain(
  email: string, 
  allowedDomains: string[]
): { isValid: boolean; message?: string } {
  const { isValid, message } = validateEmail(email);
  
  if (!isValid) {
    return { isValid, message };
  }

  const domain = email.split('@')[1];
  
  if (!allowedDomains.includes(domain)) {
    return { 
      isValid: false, 
      message: `Email com domínio não permitido. Use um dos seguintes: ${allowedDomains.join(', ')}` 
    };
  }

  return { isValid: true };
} 