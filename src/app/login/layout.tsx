import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionWrapper } from "@/providers/session-wrapper";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <SessionWrapper session={session}>{children}</SessionWrapper>;
} 