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

    if (!session || session.user.role !== "ADMIN") {
      return new Response("Não autorizado", { status: 401 });
    }

    const body = await request.json();

    const escola = await prisma.school.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        email: body.email,
        phone: body.phone,
        website: body.website,
      },
    });

    return Response.json(escola);
  } catch (error) {
    console.error("Erro ao criar escola:", error);
    return new Response("Erro interno do servidor", { status: 500 });
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