export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const escolas = await prisma.school.findMany({
      include: {
        gestor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        turmas: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      escolas.map((escola) => ({
        id: escola.id,
        name: escola.name,
        turmas: escola.turmas,
        gestor: escola.gestor
          ? {
              id: escola.gestor.id,
              name: escola.gestor.user.name,
              email: escola.gestor.user.email,
            }
          : null,
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar escolas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 