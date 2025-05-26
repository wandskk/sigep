export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { School, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca o gestor e suas escolas
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

    // Busca os professores vinculados às escolas do gestor
    const escolasIds = gestor.escolas.map((escola: School) => escola.id);
    
    // Buscar todos os professores vinculados às escolas do gestor
    const professores = await prisma.professor.findMany({
      where: {
        escolaId: {
          in: escolasIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        escola: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
    
    // Formata os dados para enviar ao frontend
    const formattedProfessores = professores.map(professor => ({
      id: professor.id,
      nome: professor.user.name,
      email: professor.user.email,
      escola: professor.escola ? {
        id: professor.escola.id,
        nome: professor.escola.name,
      } : null,
    }));

    return NextResponse.json(formattedProfessores);
  } catch (error) {
    console.error("[PROFESSORES_GET]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GESTOR") {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { nome, email } = await request.json();

    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    if (!email) {
      return new NextResponse("Email é obrigatório", { status: 400 });
    }

    // Verifica se já existe um usuário com este email
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (usuarioExistente) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    // Busca o gestor e suas escolas
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

    // Cria uma senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-8);
    const senhaHash = await hash(senhaTemporaria, 10);

    // Cria o usuário com o papel de professor
    const usuario = await prisma.user.create({
      data: {
        name: nome,
        email,
        password: senhaHash,
        role: UserRole.PROFESSOR,
      },
    });

    // Cria o professor associado ao usuário e à escola do gestor
    const professor = await prisma.professor.create({
      data: {
        userId: usuario.id,
        escolaId: gestor.escolas[0].id, // Vincula à primeira escola do gestor
      },
    });

    // Retorna os dados do professor criado
    return NextResponse.json({
      id: professor.id,
      nome: usuario.name,
      email: usuario.email,
      escola: {
        id: gestor.escolas[0].id,
        nome: gestor.escolas[0].name
      },
      senhaTemporaria, // Incluir apenas em ambiente de desenvolvimento
    });
  } catch (error) {
    console.error("[PROFESSORES_POST]", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 