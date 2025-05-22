import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/auth/prisma-adapter";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const createSchoolSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório").max(2, "Estado deve ter 2 caracteres"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Dados recebidos para criação de escola:', body);
    let validatedData;
    try {
      validatedData = createSchoolSchema.parse(body);
    } catch (zodError) {
      console.error('Erro de validação Zod:', zodError);
      return NextResponse.json(
        { message: "Dados inválidos", errors: zodError.errors },
        { status: 400 }
      );
    }

    // Verificar se já existe uma escola com o mesmo email
    const existingSchool = await prisma.school.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSchool) {
      return NextResponse.json(
        { message: "Já existe uma escola cadastrada com este email" },
        { status: 400 }
      );
    }

    try {
      const school = await prisma.school.create({
        data: validatedData,
      });
      return NextResponse.json(school, { status: 201 });
    } catch (dbError) {
      console.error('Erro ao criar escola no banco:', dbError);
      return NextResponse.json(
        { message: "Erro ao criar escola no banco de dados", error: dbError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro inesperado ao criar escola:", error);
    return NextResponse.json(
      { message: "Erro inesperado ao criar escola", error },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    const schools = await prisma.school.findMany({
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error("Erro ao buscar escolas:", error);
    return NextResponse.json(
      { message: "Erro ao buscar escolas" },
      { status: 500 }
    );
  }
} 