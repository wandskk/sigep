import { compare, hash } from "bcrypt";
import { prisma } from "./prisma-adapter";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

// Interface para criar um novo usuário
export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Interface para resultado da autenticação
export interface AuthResult {
  success: boolean;
  message?: string;
  user?: any;
}

// Serviço de autenticação
export const AuthService = {
  // Criar um novo usuário
  async createUser({ name, email, password, role = UserRole.ALUNO }: CreateUserParams): Promise<AuthResult> {
    try {
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
      const hashedPassword = await hash(password, 10);

      // Cria o usuário no banco
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        }
      });

      // Remove a senha do objeto retornado
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
  },

  // Autenticar um usuário
  async authenticateUser(email: string, password: string): Promise<AuthResult> {
    try {
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
      const passwordMatch = await compare(password, user.password);

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
  },

  // Gerar token de redefinição de senha
  async generatePasswordResetToken(email: string): Promise<AuthResult> {
    try {
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
      const token = crypto.randomUUID();
      
      // Define a expiração (24 horas)
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
  },

  // Redefinir senha com token
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
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
      const hashedPassword = await hash(newPassword, 10);

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
  },

  // Verificar se o usuário tem permissão para determinada ação
  hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }
}; 