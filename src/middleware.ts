import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "@prisma/client";

// Definindo as rotas protegidas por papel
const roleRoutes: Record<string, UserRole[]> = {
  "/dashboard": ["ALUNO", "PROFESSOR", "GESTOR", "SECRETARIA", "ADMIN"],
  "/alunos": ["GESTOR", "SECRETARIA", "ADMIN"],
  "/professores": ["GESTOR", "SECRETARIA", "ADMIN"],
  "/turmas": ["PROFESSOR", "GESTOR", "SECRETARIA", "ADMIN"],
  "/escolas": ["SECRETARIA", "ADMIN"],
  "/admin": ["ADMIN"],
};

// Middleware de autenticação com next-auth
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificar se o usuário tem acesso à rota
    if (path in roleRoutes) {
      const userRole = token?.role as UserRole;
      const allowedRoles = roleRoutes[path];

      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirecionar para a página de acesso negado
        return NextResponse.redirect(new URL("/acesso-negado", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Apenas executar este middleware em rotas protegidas
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuração das rotas onde o middleware será aplicado
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/alunos/:path*",
    "/professores/:path*",
    "/turmas/:path*",
    "/escolas/:path*",
    "/admin/:path*",
  ],
}; 