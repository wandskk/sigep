"use client";

import { UserRole } from "@prisma/client";
import { Navigation } from "@/components/layout/Navigation";

export default function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navigation 
        role={UserRole.SECRETARIA}
        basePath="/secretaria"
        title="SIGEP Secretaria"
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
} 