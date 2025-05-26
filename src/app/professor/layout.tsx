import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfessorLayoutClient } from "./ProfessorLayoutClient";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <ProfessorLayoutClient session={session}>{children}</ProfessorLayoutClient>;
}
