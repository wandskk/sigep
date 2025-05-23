"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import GlobalLoading from "@/app/loading";

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType>({ isLoading: false });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleStop = () => {
      setIsLoading(false);
    };

    // Detecta mudanças na URL
    handleStart();
    const timeout = setTimeout(handleStop, 500); // Pequeno delay para evitar flash

    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]); // Re-executa quando a URL muda

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
      {isLoading && <GlobalLoading />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext); 