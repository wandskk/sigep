import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// Handler para as rotas de autenticação (App Router)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
