import { NextResponse } from "next/server";
import { getAdminDashboardStats } from "@/lib/actions/dashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { UserRole } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar autenticação e autorização
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar estatísticas
    const stats = await getAdminDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[API] Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas do dashboard" },
      { status: 500 }
    );
  }
} 