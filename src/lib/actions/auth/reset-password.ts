"use server";

import { prisma } from "../../../lib/auth/prisma-adapter";
import { generateSecureToken, calculateTokenExpiry, hashPassword } from "../../utils/auth.utils";
import { AuthResult, ResetPasswordParams } from "../../types/auth.types";
import { validatePassword } from "../../validators/auth/password.validator";
import { validateEmail } from "../../validators/auth/email.validator";
import { PASSWORD_RESET_TOKEN_EXPIRY } from "../../constants/auth";

/**
 * Ação do servidor para gerar um token de redefinição de senha
 * @param email Email do usuário
 * @returns Resultado da operação
 */
export async function generatePasswordResetToken(email: string): Promise<AuthResult> {
  try {
    // Valida o email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        message: emailValidation.message
      };
    }
    
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Por segurança, não revelamos que o e-mail não existe
      return {
        success: true,
        message: "Se o e-mail estiver cadastrado, enviaremos um link para redefinição de senha."
      };
    }

    // Gera um token aleatório
    const token = generateSecureToken();
    
    // Define a expiração
    const expires = calculateTokenExpiry(PASSWORD_RESET_TOKEN_EXPIRY);

    // Remove tokens antigos do mesmo usuário
    await prisma.passwordReset.deleteMany({
      where: { email }
    });

    // Salva o token no banco
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expires
      }
    });

    // Aqui você implementaria o envio de e-mail com o token
    // Por enquanto, apenas retornamos o token para fins de desenvolvimento
    return {
      success: true,
      message: "Se o e-mail estiver cadastrado, enviaremos um link para redefinição de senha.",
      user: { email, token } // Em produção, não retornar o token
    };
  } catch (error) {
    console.error("Erro ao gerar token de redefinição de senha:", error);
    return {
      success: false,
      message: "Erro ao processar sua solicitação. Tente novamente mais tarde."
    };
  }
}

/**
 * Ação do servidor para redefinir a senha usando um token
 * @param params Parâmetros para redefinição de senha
 * @returns Resultado da operação
 */
export async function resetPassword(params: ResetPasswordParams): Promise<AuthResult> {
  try {
    const { token, newPassword } = params;
    
    // Valida a nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: passwordValidation.message
      };
    }

    // Busca o token no banco
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token }
    });

    // Verifica se o token existe e não expirou
    if (!passwordReset || passwordReset.expires < new Date()) {
      return {
        success: false,
        message: "Token inválido ou expirado."
      };
    }

    // Criptografa a nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualiza a senha do usuário
    await prisma.user.update({
      where: { email: passwordReset.email },
      data: { password: hashedPassword }
    });

    // Remove o token usado
    await prisma.passwordReset.delete({
      where: { token }
    });

    return {
      success: true,
      message: "Senha redefinida com sucesso."
    };
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return {
      success: false,
      message: "Erro ao redefinir senha. Tente novamente mais tarde."
    };
  }
} 