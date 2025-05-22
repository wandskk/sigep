"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Chama o signOut do NextAuth que limpa a sessão
    signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
    </div>
  );
} 