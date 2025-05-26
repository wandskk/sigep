import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { CreateSchoolFormData } from "@/types/school";

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

    const data: CreateSchoolFormData = await request.json();

    const school = await prisma.school.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        gestorId: data.gestorId || null,
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Erro ao atualizar escola:", error);
    return new NextResponse(
      "Não foi possível atualizar os dados da escola",
      { status: 500 }
    );
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