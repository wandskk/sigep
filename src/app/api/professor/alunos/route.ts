export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca o professor
    const professor = await prisma.professor.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    // Busca as turmas do professor
    const turmasProfessor = await prisma.professorTurma.findMany({
      where: {
        professorId: professor.id,
      },
      include: {
        turma: {
          include: {
            alunos: {
              include: {
                aluno: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Formata os dados dos alunos
    const alunosMap = new Map();

    turmasProfessor.forEach((pt) => {
      pt.turma.alunos.forEach((at) => {
        if (!alunosMap.has(at.aluno.id)) {
          alunosMap.set(at.aluno.id, {
            id: at.aluno.id,
            nome: at.aluno.user.name,
            matricula: at.aluno.matricula,
            turmas: [],
          });
        }
        alunosMap.get(at.aluno.id).turmas.push({
          id: pt.turma.id,
          nome: pt.turma.nome,
          codigo: pt.turma.codigo || "",
        });
      });
    });

    const alunos = Array.from(alunosMap.values());

    return NextResponse.json({ alunos });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
} 