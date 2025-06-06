import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/lib/auth/auth-service";
import { User, UserRole } from "@prisma/client";

// Define a configuração do NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await AuthService.authenticateUser(
            credentials.email,
            credentials.password
          );

          if (!result.success || !result.user) return null;

          const user = result.user as User;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // Atualizar a cada 24 horas
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Se for uma atualização da sessão, buscar dados atualizados do usuário
      if (trigger === "update" && token.id) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, name: true, email: true, role: true, firstLogin: true }
          });
          
          if (updatedUser) {
            token.name = updatedUser.name;
            token.email = updatedUser.email;
            token.role = updatedUser.role;
            token.firstLogin = updatedUser.firstLogin;
          }
        } catch (error) {
          console.error("Erro ao atualizar token JWT:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 