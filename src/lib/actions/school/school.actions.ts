import { prisma } from "@/lib/prisma";
import { CreateSchoolFormData } from "@/types/school";

export async function updateSchool(id: string, data: CreateSchoolFormData) {
  try {
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

    return school;
  } catch (error) {
    console.error("Erro ao atualizar escola:", error);
    throw new Error("Não foi possível atualizar a escola");
  }
} 