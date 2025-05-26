"use client";

import { SessionProvider } from "next-auth/react";
import { LoadingProvider } from "@/providers/loading-provider";

interface ProvidersProps {
  children: React.ReactNode;
  session: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </SessionProvider>
  );
} 