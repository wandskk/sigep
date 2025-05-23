import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { VoltarButton } from "./components/VoltarButton";
import { TabelaAlunos } from "./components/TabelaAlunos";
import { getTurmaWithAlunos } from "@/lib/actions/turma/turma.actions";
import { formatarAlunosTurma } from "@/lib/utils/turma";
import { UserRole } from "@prisma/client";
import { getGestorByUserId } from "@/lib/actions/gestor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlunosTurmaPage({ params }: PageProps) {
  // Aguarda a resolução dos parâmetros
  const { id } = await params;
  let turma;
  let error: string | null = null;

  try {
    // Verificação de autenticação e autorização
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.GESTOR) {
      redirect("/login");
    }

    // Busca dados do gestor e escola usando a action
    const gestor = await getGestorByUserId(session.user.id);

    if (!gestor || gestor.escolas.length === 0) {
      throw new Error("Gestor não encontrado ou sem escolas");
    }

    // Busca a turma com seus alunos usando a action
    turma = await getTurmaWithAlunos(
      id,
      gestor.escolas.map((escola) => escola.id)
    );

    if (!turma) {
      throw new Error("Turma não encontrada");
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro ao carregar dados da turma";
  }

  if (error || !turma) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="error" className="mb-6">
              {error || "Não foi possível carregar os dados da turma"}
            </Alert>
            <VoltarButton turmaId={id} />
          </div>
        </div>
      </div>
    );
  }

  // Formata os dados dos alunos
  const alunosFormatados = formatarAlunosTurma(turma);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <VoltarButton turmaId={id} />
              <h1 className="text-3xl font-bold text-[#374151]">Alunos da Turma {turma.nome}</h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                Total de alunos: {alunosFormatados.length}
              </p>
            </div>
          </div>

          <TabelaAlunos alunos={alunosFormatados} />
        </div>
      </div>
    </div>
  );
} 