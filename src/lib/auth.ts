import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/entrar");
  }
  
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    redirect("/acesso-negado");
  }
  
  return user;
}

export async function requirePermission(requiredPermission: string) {
  const user = await requireAuth();
  
  if (!user.permissions.includes(requiredPermission)) {
    redirect("/acesso-negado");
  }
  
  return user;
} 