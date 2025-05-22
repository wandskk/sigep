import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../../constants/auth";

/**
 * Schema de validação para o formulário de login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email({ message: "Formato de email inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(1, { message: "A senha é obrigatória" }),
  remember: z.boolean().optional(),
});

/**
 * Schema de validação para o formulário de registro
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: "O nome é obrigatório" })
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email({ message: "Formato de email inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(MIN_PASSWORD_LENGTH, { 
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` 
    })
    .regex(/[0-9]/, { 
      message: "A senha deve conter pelo menos um número" 
    })
    .regex(/[A-Z]/, { 
      message: "A senha deve conter pelo menos uma letra maiúscula" 
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { 
      message: "A senha deve conter pelo menos um caractere especial" 
    }),
  confirmPassword: z
    .string({ required_error: "A confirmação de senha é obrigatória" })
    .min(1, { message: "A confirmação de senha é obrigatória" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

/**
 * Schema de validação para o formulário de recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email({ message: "Formato de email inválido" }),
});

/**
 * Schema de validação para o formulário de redefinição de senha
 */
export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: "A nova senha é obrigatória" })
    .min(MIN_PASSWORD_LENGTH, { 
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` 
    })
    .regex(/[0-9]/, { 
      message: "A senha deve conter pelo menos um número" 
    })
    .regex(/[A-Z]/, { 
      message: "A senha deve conter pelo menos uma letra maiúscula" 
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { 
      message: "A senha deve conter pelo menos um caractere especial" 
    }),
  confirmPassword: z
    .string({ required_error: "A confirmação de senha é obrigatória" })
    .min(1, { message: "A confirmação de senha é obrigatória" }),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
}); 