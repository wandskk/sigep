import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      // O NextAuth.js já cuida de limpar a sessão quando redirecionamos para /api/auth/signout
      return NextResponse.redirect(new URL("/api/auth/signout", process.env.NEXTAUTH_URL));
    }

    // Se não houver sessão, redireciona direto para o login
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }
} 