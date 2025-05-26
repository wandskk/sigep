import { z } from "zod";

// Regex para validar números de telefone com ou sem formatação
const phoneRegex = /^(\d{10,11}|\(\d{2}\) \d{4,5}-\d{4})$/;

export const createSchoolSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .min(2, "Estado deve ter 2 caracteres")
    .max(2, "Estado deve ter 2 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine((val) => {
      // Remove tudo que não for número para validação
      const numbers = val.replace(/\D/g, "");
      return numbers.length === 10 || numbers.length === 11;
    }, "Telefone inválido. Use o formato (00) 0000-0000 ou (00) 00000-0000"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  website: z
    .string()
    .url("Website inválido")
    .optional()
    .or(z.literal("")),
  gestorId: z.string().optional(),
});

export type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;

export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
  gestorId: string | null;
  gestor?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
} 