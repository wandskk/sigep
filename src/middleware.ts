import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "@prisma/client";
import { getToken } from "next-auth/jwt";

// Definindo as rotas protegidas por papel
const roleRoutes: Record<string, UserRole[]> = {
  "/dashboard": ["ALUNO", "PROFESSOR", "GESTOR", "SECRETARIA", "ADMIN"],
  "/aluno": ["ALUNO"],
  "/professor": ["PROFESSOR"],
  "/gestor": ["GESTOR"],
  "/secretaria": ["SECRETARIA"],
  "/admin": ["ADMIN"],
};

// Rotas públicas que não requerem verificação de primeiro login
const publicRoutes = [
  "/login",
  "/registrar",
  "/esqueci-senha",
  "/api/auth",
  "/trocar-senha",
];

// Middleware de autenticação com next-auth
export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Se a rota estiver na lista de públicas, permitir acesso sem mais verificações
    if (publicRoutes.some(route => path.startsWith(route))) {
      return NextResponse.next();
    }

    // Verificar se o usuário tem acesso à rota baseado no papel
    for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
      if (path.startsWith(routePrefix)) {
        const userRole = token?.role as UserRole;
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          // Redirecionar para a página de acesso negado
          return NextResponse.redirect(new URL("/acesso-negado", req.url));
        }
      }
    }

    // Verificar se é o primeiro login do usuário
    try {
      // Se não for uma requisição à API, verificar o primeiro login
      if (!path.startsWith('/api/')) {
        const response = await fetch(new URL("/api/auth/check-first-login", req.url), {
          headers: {
            Cookie: req.headers.get("cookie") || "",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Se for o primeiro login e não estiver na página de trocar senha, redirecionar
          if (data.firstLogin && !path.startsWith('/trocar-senha')) {
            return NextResponse.redirect(new URL("/trocar-senha", req.url));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar primeiro login:", error);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Apenas executar este middleware em rotas protegidas
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Não exigir token para rotas públicas
        if (publicRoutes.some(route => path.startsWith(route))) {
          return true;
        }
        // Exigir token para as demais rotas
        return !!token;
      },
    },
  }
);

// Configuração das rotas onde o middleware será aplicado
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 