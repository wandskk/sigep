import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Schema de validação para o formulário de perfil de usuário
 */
export const userProfileSchema = z.object({
  name: z
    .string({ required_error: "O nome é obrigatório" })
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email({ message: "Formato de email inválido" }),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, { 
      message: "Formato de telefone inválido. Use (99) 99999-9999" 
    })
    .optional()
    .nullable(),
  role: z.nativeEnum(UserRole, {
    required_error: "O perfil é obrigatório",
    invalid_type_error: "Perfil inválido",
  }),
});

/**
 * Schema de validação para o formulário de dados de aluno
 */
export const studentDataSchema = z.object({
  registration: z
    .string({ required_error: "A matrícula é obrigatória" })
    .min(5, { message: "A matrícula deve ter pelo menos 5 caracteres" }),
  birthDate: z
    .string({ required_error: "A data de nascimento é obrigatória" })
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { 
      message: "Data de nascimento inválida" 
    }),
  responsible: z
    .string({ required_error: "O nome do responsável é obrigatório" })
    .min(3, { message: "O nome do responsável deve ter pelo menos 3 caracteres" }),
  phone: z
    .string({ required_error: "O telefone é obrigatório" })
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, { 
      message: "Formato de telefone inválido. Use (99) 99999-9999" 
    }),
  address: z
    .string({ required_error: "O endereço é obrigatório" })
    .min(5, { message: "O endereço deve ter pelo menos 5 caracteres" }),
});

/**
 * Schema de validação para o formulário de dados de professor
 */
export const teacherDataSchema = z.object({
  education: z
    .string({ required_error: "A formação é obrigatória" })
    .min(3, { message: "A formação deve ter pelo menos 3 caracteres" }),
  specialization: z
    .string({ required_error: "A especialidade é obrigatória" })
    .min(3, { message: "A especialidade deve ter pelo menos 3 caracteres" }),
});

/**
 * Schema de validação para o formulário de dados de gestor
 */
export const managerDataSchema = z.object({
  position: z
    .string({ required_error: "O cargo é obrigatório" })
    .min(3, { message: "O cargo deve ter pelo menos 3 caracteres" }),
});

/**
 * Schema de validação para o formulário de dados de secretaria
 */
export const secretaryDataSchema = z.object({
  department: z
    .string({ required_error: "O departamento é obrigatório" })
    .min(3, { message: "O departamento deve ter pelo menos 3 caracteres" }),
  position: z
    .string({ required_error: "O cargo é obrigatório" })
    .min(3, { message: "O cargo deve ter pelo menos 3 caracteres" }),
}); 