"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Barra de navegação */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-[#1E3A8A]">
                  SIGEP Admin
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/admin")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/usuarios"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/admin/usuarios")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Usuários
                </Link>
                <Link
                  href="/admin/escolas"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/admin/escolas")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Escolas
                </Link>
                <Link
                  href="/admin/professores"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/admin/professores")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Professores
                </Link>
                <Link
                  href="/admin/configuracoes"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/admin/configuracoes")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Configurações
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-[#374151]/70">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm text-[#1E3A8A] hover:text-[#15286D] font-medium"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main>{children}</main>
    </div>
  );
} 