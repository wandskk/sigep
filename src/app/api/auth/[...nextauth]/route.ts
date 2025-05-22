import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/lib/auth/auth-service";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Verificar se os campos foram preenchidos
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Usar o serviço de autenticação para validar as credenciais
          const result = await AuthService.authenticateUser(
            credentials.email,
            credentials.password
          );

          if (!result.success || !result.user) {
            return null;
          }

          // Retornar o usuário para NextAuth
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            image: result.user.image
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login", // Redirecionar para login em caso de erro
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    // Adiciona informações ao JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Adiciona informações à sessão
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "sigep-secret-key-dev",
});

export { handler as GET, handler as POST }; 