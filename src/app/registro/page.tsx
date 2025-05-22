"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="text-center">
        <h2 className="text-xl font-medium text-[#374151]">Redirecionando...</h2>
        <p className="mt-2 text-gray-500">Criação de contas não disponível no momento.</p>
      </div>
    </div>
  );
} 