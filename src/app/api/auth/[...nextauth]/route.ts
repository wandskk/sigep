import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts-edge";
import { z } from "zod";
import { db } from "@/lib/db";
import { type JWT } from "next-auth/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credenciais não fornecidas");
        }

        try {
          const result = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!result.success) {
            return null;
          }

          const { email, password } = result.data;
          const user = await db.user.findUnique({
            where: { email },
            include: {
              role: true,
            },
          });

          if (!user || !user.hashedPassword) {
            return null;
          }

          const passwordsMatch = await compare(
            password,
            user.hashedPassword
          );

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role.name,
            permissions: user.role.permissions,
          };
        } catch (error) {
          console.error("Erro durante autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 