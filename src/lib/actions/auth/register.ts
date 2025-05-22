"use server";

import { prisma } from "../../../lib/auth/prisma-adapter";
import { hashPassword } from "../../utils/auth.utils";
import { CreateUserParams, AuthResult } from "../../types/auth.types";
import { validateEmail } from "../../validators/auth/email.validator";
import { validatePassword } from "../../validators/auth/password.validator";
import { UserRole } from "@prisma/client";

/**
 * Ação do servidor para criar um novo usuário
 * @param params Parâmetros para criação de usuário
 * @returns Resultado da operação
 */
export async function registerUser(params: CreateUserParams): Promise<AuthResult> {
  try {
    const { name, email, password, role = UserRole.ALUNO } = params;
    
    // Valida o email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        message: emailValidation.message
      };
    }
    
    // Valida a senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: passwordValidation.message
      };
    }
    
    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        success: false,
        message: "Este e-mail já está em uso."
      };
    }

    // Criptografa a senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    // Remove a senha do objeto retornado usando desestruturação
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      success: false,
      message: "Erro ao criar usuário. Tente novamente mais tarde."
    };
  }
}