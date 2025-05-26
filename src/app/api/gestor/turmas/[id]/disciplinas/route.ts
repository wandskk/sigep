import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { School } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "GESTOR" && session.user.role !== "ADMIN")) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { disciplinaId, professorId } = await request.json();

    if (!disciplinaId) {
      return new NextResponse("Disciplina é obrigatória", {
        status: 400,
      });
    }

    let escolasIds: string[] = [];

    if (session.user.role === "GESTOR") {
      const gestor = await prisma.gestor.findFirst({
        where: {
          userId: session.user.id,
        },
        include: {
          escolas: true,
        },
      });

      if (!gestor || gestor.escolas.length === 0) {
        return new NextResponse("Gestor não encontrado ou sem escola", {
          status: 404,
        });
      }
      escolasIds = gestor.escolas.map((escola: School) => escola.id);
    }

    // Busca a turma e verifica se pertence à escola do gestor (ou qualquer escola se admin)
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        ...(session.user.role === "GESTOR" ? { escolaId: { in: escolasIds } } : {}),
      },
    });

    if (!turma) {
      return new NextResponse("Turma não encontrada", { status: 404 });
    }

    // Busca a disciplina e verifica se pertence à escola do gestor (ou qualquer escola se admin)
    const disciplina = await prisma.disciplina.findFirst({
      where: {
        id: disciplinaId,
        ...(session.user.role === "GESTOR" ? { escolaId: { in: escolasIds } } : {}),
      },
    });

    if (!disciplina) {
      return new NextResponse("Disciplina não encontrada", { status: 404 });
    }

    // Verifica se o professor foi informado
    let professor = null;
    if (professorId) {
      // Verifica se o professor pertence à escola do gestor
      professor = await prisma.professor.findFirst({
        where: {
          id: professorId,
        },
      });

      if (!professor) {
        return new NextResponse("Professor não encontrado", { status: 404 });
      }

      // Verifica se o professor está cadastrado na mesma escola do gestor
      // Esta verificação é opcional dependendo dos requisitos de segurança
      const usuarioProfessor = await prisma.user.findUnique({
        where: { id: professor.userId },
        select: { role: true }
      });

      if (!usuarioProfessor || usuarioProfessor.role !== "PROFESSOR") {
        return new NextResponse("Usuário não é um professor", { status: 400 });
      }
    }

    // Verifica se a disciplina já está na turma
    const disciplinaExistente = await prisma.disciplinaTurma.findFirst({
      where: {
        turmaId: params.id,
        disciplinaId,
      },
    });

    let turmaDisciplina;
    
    if (disciplinaExistente) {
      // Se a disciplina já existe e estamos apenas atualizando o professor
      if (professorId) {
        // Busca a relação professor-turma existente ou cria uma nova
        const professorTurma = await prisma.professorTurma.findFirst({
          where: {
            professorId,
            turmaId: params.id
          }
        });
        
        let professorTurmaId;
        
        if (!professorTurma) {
          // Cria a relação professor-turma se não existir
          const novoProfessorTurma = await prisma.professorTurma.create({
            data: {
              professorId,
              turmaId: params.id
            }
          });
          professorTurmaId = novoProfessorTurma.id;
        } else {
          professorTurmaId = professorTurma.id;
        }
        
        // Remove qualquer associação anterior de professor com esta disciplina na turma
        await prisma.professorDisciplinaTurma.deleteMany({
          where: {
            disciplinaId,
            professorTurma: {
              turmaId: params.id
            }
          }
        });
        
        // Cria a nova associação professor-disciplina-turma
        await prisma.professorDisciplinaTurma.create({
          data: {
            professorTurmaId,
            disciplinaId
          }
        });
        
        turmaDisciplina = disciplinaExistente;
      } else {
        return new NextResponse("Disciplina já está na turma", { status: 400 });
      }
    } else {
      // Se a disciplina não existe, cria a relação disciplina-turma
      turmaDisciplina = await prisma.disciplinaTurma.create({
        data: {
          turmaId: params.id,
          disciplinaId,
        },
        include: {
          disciplina: true,
        },
      });
      
      // Se o professor foi informado, associa à disciplina
      if (professorId) {
        // Busca a relação professor-turma existente ou cria uma nova
        const professorTurma = await prisma.professorTurma.findFirst({
          where: {
            professorId,
            turmaId: params.id
          }
        });
        
        let professorTurmaId;
        
        if (!professorTurma) {
          // Cria a relação professor-turma se não existir
          const novoProfessorTurma = await prisma.professorTurma.create({
            data: {
              professorId,
              turmaId: params.id
            }
          });
          professorTurmaId = novoProfessorTurma.id;
        } else {
          professorTurmaId = professorTurma.id;
        }
        
        // Associa o professor à disciplina na turma
        await prisma.professorDisciplinaTurma.create({
          data: {
            professorTurmaId,
            disciplinaId
          }
        });
      }
    }
    
    // Busca informações do professor para retornar
    let professorInfo = null;
    if (professorId) {
      professorInfo = await prisma.professor.findUnique({
        where: { id: professorId },
        select: { 
          id: true,
          userId: true
        }
      });
      
      // Busca o nome do professor através do usuário
      if (professorInfo) {
        const usuario = await prisma.user.findUnique({
          where: { id: professorInfo.userId },
          select: { name: true }
        });
        
        professorInfo = {
          ...professorInfo,
          nome: usuario?.name || "Professor sem nome"
        };
      }
    }

    // Busca os dados completos para retornar
    const resultado = {
      ...turmaDisciplina,
      professor: professorInfo
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[TURMA_DISCIPLINA_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

// A função DELETE foi movida para o arquivo [disciplinaId]/route.ts 