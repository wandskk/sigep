import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado esquerdo - Background decorativo */}
      <div className="hidden md:flex md:w-1/2 bg-[#1E3A8A] relative">
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="dots"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="z-10 flex items-center justify-center w-full h-full">
          <div className="text-center text-white p-8">
            <h1 className="text-5xl font-bold mb-4">SIGEP</h1>
            <p className="text-xl font-light mb-6">
              Sistema de Gestão Escolar Pública de Baraúna
            </p>
            <div className="w-20 h-1 bg-[#10B981] mx-auto"></div>
            <p className="mt-8 text-white/80 max-w-md mx-auto">
              Plataforma unificada para gestão acadêmica, administrativa e
              pedagógica das escolas municipais.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F3F4F6] p-6">
        <LoginForm />
      </div>
    </div>
  );
}
