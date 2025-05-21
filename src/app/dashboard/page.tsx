import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();
  
  // Redirecionar com base no papel (role) do usuário
  switch (user.role) {
    case "aluno":
      redirect("/aluno");
    case "professor":
      redirect("/professor");
    case "gestor":
      redirect("/gestor");
    case "secretaria":
      redirect("/secretaria");
    default:
      // Se o usuário tiver um papel desconhecido, redirecione para uma página padrão
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center">Bem-vindo ao SIGEP</h1>
            <p className="text-center">
              Sistema de Gestão Escolar de Baraúna
            </p>
            <p className="text-center">
              Seu tipo de usuário não possui um dashboard específico.
            </p>
          </div>
        </div>
      );
  }
} 