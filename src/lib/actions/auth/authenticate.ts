"use server";

import { prisma } from "../../../lib/auth/prisma-adapter";
import { comparePasswords } from "../../utils/auth.utils";
import { LoginParams, AuthResult } from "../../types/auth.types";
import { validateEmail } from "../../validators/auth/email.validator";

/**
 * Ação do servidor para autenticar um usuário
 * @param params Parâmetros de login (email e senha)
 * @returns Resultado da autenticação
 */
export async function authenticateUser(params: LoginParams): Promise<AuthResult> {
  try {
    const { email, password } = params;
    
    // Valida o email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        message: emailValidation.message
      };
    }
    
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Se não encontrar o usuário
    if (!user) {
      return {
        success: false,
        message: "Credenciais inválidas."
      };
    }

    // Verifica se a senha está correta
    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Credenciais inválidas."
      };
    }

    // Remove a senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return {
      success: false,
      message: "Erro ao fazer login. Tente novamente mais tarde."
    };
  }
} 