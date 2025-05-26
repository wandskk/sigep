import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { UserRole } from "@prisma/client";
import { getAllAlunos } from "@/lib/actions/aluno";
import { formatarAlunos, AlunoFormatado } from "@/lib/utils/aluno/index";
import { Metadata } from "next";
import { AlunosAdminContent } from "./components/AlunosAdminContent";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Alunos - Admin",
  description: "Página de gerenciamento de todos os alunos do sistema",
};

export default async function AlunosAdminPage() {
  let alunos: AlunoFormatado[] = [];
  let error: string | null = null;

  // Verificação de autenticação e autorização
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  try {
    // Busca todos os alunos do sistema
    const alunosData = await getAllAlunos();
    alunos = formatarAlunos(alunosData);
  } catch (err) {
    error = "Não foi possível carregar os dados dos alunos";
    console.error("Erro ao buscar alunos:", err);
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <AlunosAdminContent alunosIniciais={alunos} />
    </Container>
  );
} 