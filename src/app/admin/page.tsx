import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AdminDashboardContent } from "./components/AdminDashboardContent";

export default async function AdminDashboard() {
  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  return <AdminDashboardContent />;
} 