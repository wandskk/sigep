"use client";

import { UserRole } from "@prisma/client";
import { Navigation } from "@/components/layout/Navigation";
import { SessionWrapper } from "@/providers/session-wrapper";

interface ProfessorLayoutClientProps {
  children: React.ReactNode;
  session: any;
}

export function ProfessorLayoutClient({ children, session }: ProfessorLayoutClientProps) {
  return (
    <SessionWrapper session={session}>
      <div className="min-h-screen bg-[#F3F4F6]">
        <Navigation 
          role={UserRole.PROFESSOR}
          basePath="/professor"
          title="SIGEP Professor"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionWrapper>
  );
} 