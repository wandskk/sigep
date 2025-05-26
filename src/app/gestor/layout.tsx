import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GestorLayoutClient } from "./GestorLayoutClient";

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <GestorLayoutClient session={session}>{children}</GestorLayoutClient>;
} 