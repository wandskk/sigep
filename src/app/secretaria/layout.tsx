import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SecretariaLayoutClient } from "./SecretariaLayoutClient";

export default async function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <SecretariaLayoutClient session={session}>{children}</SecretariaLayoutClient>;
} 