import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { UserRole } from "@prisma/client";

interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string | null;
  gestorId: string | null;
  gestor?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: {
        id,
      },
      include: {
        gestor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!school) {
      return new NextResponse("Escola não encontrada", { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Erro ao buscar escola:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { name, address, city, state, phone, email, website, gestorId } = body;

    // Validação básica
    if (!name || !address || !city || !state || !phone || !email) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se a escola existe
    const existingSchool = await (prisma as any).school.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingSchool) {
      return new NextResponse("Escola não encontrada", { status: 404 });
    }

    // Se um gestor foi especificado, verifica se ele existe
    if (gestorId) {
      const gestor = await (prisma as any).gestor.findUnique({
        where: { id: gestorId },
      });
      
      if (!gestor) {
        return new NextResponse("Gestor não encontrado", { status: 404 });
      }
      
      // Verificar se o gestor já está atribuído a outra escola
      const escolaExistente = await (prisma as any).school.findFirst({
        where: { 
          gestorId: gestorId,
          NOT: { id }
        },
      });
      
      if (escolaExistente) {
        return new NextResponse("Este gestor já está atribuído a outra escola", { status: 400 });
      }
    }

    // Atualiza a escola
    const updatedSchool = await (prisma as any).school.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        city,
        state,
        phone,
        email,
        website: website || null,
        gestorId: gestorId || null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        website: true,
        gestorId: true,
        gestor: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }) as School;

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Erro ao atualizar escola:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Verificar se a escola existe
    const existingSchool = await (prisma as any).school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      return new NextResponse("Escola não encontrada", { status: 404 });
    }

    // Excluir a escola
    await (prisma as any).school.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir escola:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 