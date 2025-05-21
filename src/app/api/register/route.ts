import { NextResponse } from "next/server";
import { hash } from "bcrypt-ts-edge";
import { z } from "zod";
import { db } from "@/lib/db";

// Esquema de validação
const registrationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar os dados de entrada
    const result = registrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Dados de entrada inválidos", errors: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Verificar se o e-mail já está em uso
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "Este e-mail já está em uso" },
        { status: 400 }
      );
    }
    
    // Buscar a role padrão para novos usuários (aluno)
    let defaultRole = await db.role.findUnique({
      where: { name: "aluno" },
    });
    
    // Se não existir, criar a role
    if (!defaultRole) {
      defaultRole = await db.role.create({
        data: {
          name: "aluno",
          description: "Aluno do sistema",
          permissions: ["view_own_profile", "view_own_grades"],
        },
      });
    }
    
    // Criar hash da senha
    const hashedPassword = await hash(password, 10);
    
    // Criar o usuário
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
        roleId: defaultRole.id,
      },
    });
    
    // Não retornar a senha no objeto de resposta
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      {
        message: "Usuário registrado com sucesso",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 