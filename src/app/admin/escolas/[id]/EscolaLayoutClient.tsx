"use client";
import { ReactNode, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Building2, MapPin, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

function formatPhone(phone: string) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
}

interface EscolaLayoutProps {
  children: ReactNode;
  school: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string | null;
  };
}

export default function EscolaLayoutClient({
  children,
  school,
}: EscolaLayoutProps) {
  const pathname = usePathname();
  const base = `/admin/escolas/${school.id}`;

  return (
    <Container>
      {/* Cabeçalho da escola */}

      <div>{children}</div>
    </Container>
  );
}
