"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GestorLayout({
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
    } else if (status === "authenticated" && session?.user?.role !== UserRole.GESTOR) {
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

  if (!session || session.user.role !== UserRole.GESTOR) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/gestor") {
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
                <Link href="/gestor" className="text-xl font-bold text-[#1E3A8A]">
                  SIGEP Gestão Escolar
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/gestor"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/gestor")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/gestor/turmas"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/gestor/turmas")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Turmas
                </Link>
                <Link
                  href="/gestor/disciplinas"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/gestor/disciplinas")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Disciplinas
                </Link>
                <Link
                  href="/gestor/professores"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/gestor/professores")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Professores
                </Link>
                <Link
                  href="/gestor/alunos"
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive("/gestor/alunos")
                      ? "border-[#1E3A8A] text-[#374151]"
                      : "border-transparent text-[#374151]/70 hover:text-[#374151] hover:border-[#1E3A8A]"
                  )}
                >
                  Alunos
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