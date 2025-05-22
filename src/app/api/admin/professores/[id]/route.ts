import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const updateProfessorSchema = z.object({
  escolaId: z.string().uuid("ID da escola inválido")
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const professor = await prisma.professor.findUnique({
      where: { id: params.id },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        escola: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!professor) {
      return NextResponse.json({ message: "Professor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(professor);
  } catch (error) {
    console.error("[ADMIN_PROFESSOR_GET]", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    
    try {
      const { escolaId } = updateProfessorSchema.parse(body);
      
      // Verificar se a escola existe
      const escola = await prisma.school.findUnique({
        where: { id: escolaId }
      });

      if (!escola) {
        return NextResponse.json({ message: "Escola não encontrada" }, { status: 404 });
      }

      // Verificar se o professor existe
      const professorExistente = await prisma.professor.findUnique({
        where: { id: params.id }
      });

      if (!professorExistente) {
        return NextResponse.json({ message: "Professor não encontrado" }, { status: 404 });
      }

      // Atualizar a escola do professor
      const professor = await prisma.professor.update({
        where: { id: params.id },
        data: { escolaId },
        include: { 
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          escola: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return NextResponse.json({
        message: "Escola do professor atualizada com sucesso",
        professor
      });
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        return NextResponse.json({ 
          message: "Dados inválidos", 
          errors: zodError.errors 
        }, { status: 400 });
      }
      throw zodError;
    }
  } catch (error) {
    console.error("[ADMIN_PROFESSOR_PUT]", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
} 