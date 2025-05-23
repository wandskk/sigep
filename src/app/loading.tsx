import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Fundo com blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white backdrop-blur-md animate-in fade-in duration-300"></div>
      
      {/* Conteúdo do loading */}
      <div className="flex flex-col items-center gap-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin relative z-10" />
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Carregando...</p>
      </div>
    </div>
  );
} 