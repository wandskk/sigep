import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TurmaContent from "@/app/gestor/turmas/[id]/components/TurmaContent";
import { UserRole } from "@prisma/client";
import { TurmaCompleta, ProfessorInfo, DisciplinaBasica } from "@/lib/types";
import { formatarTurma, formatarProfessores, formatarDisciplinas } from "@/lib/utils/turma";
import { getTurmaPageData } from "@/lib/actions/turma";

// Tipo para os dados formatados da turma que serão passados para o componente
interface TurmaPageData {
  turma: TurmaCompleta;
  professores: ProfessorInfo[];
  disciplinas: DisciplinaBasica[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TurmaPage({ params }: PageProps) {
  // Aguarda a resolução dos parâmetros
  const { id } = await params;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.GESTOR) {
    redirect("/");
  }

  // Busca dados do gestor e escola
  const gestor = await prisma.gestor.findFirst({
    where: { userId: session.user.id },
    include: { escolas: true },
  });

  if (!gestor || gestor.escolas.length === 0) {
    redirect("/");
  }

  if (!id) {
    throw new Error("Parâmetro de ID não encontrado na URL.");
  }

  const escolaId = gestor.escolas[0].id;

  // Busca todos os dados necessários usando a action
  const { turma, professores, disciplinas } = await getTurmaPageData(id, escolaId);

  // Dados formatados para passar ao componente
  const pageData: TurmaPageData = {
    turma: formatarTurma(turma),
    professores: formatarProfessores(professores),
    disciplinas: formatarDisciplinas(disciplinas),
  };

  return <TurmaContent {...pageData} />;
}
