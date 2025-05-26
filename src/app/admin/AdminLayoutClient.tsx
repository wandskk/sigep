"use client";

import { UserRole } from "@prisma/client";
import { Navigation } from "@/components/layout/Navigation";
import { SessionWrapper } from "@/providers/session-wrapper";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: any;
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  return (
    <SessionWrapper session={session}>
      <div className="min-h-screen bg-[#F3F4F6]">
        <Navigation 
          role={UserRole.ADMIN}
          basePath="/admin"
          title="SIGEP Admin"
        />
        <main>
          {children}
        </main>
      </div>
    </SessionWrapper>
  );
} 