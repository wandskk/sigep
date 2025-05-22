import { z } from "zod";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema,
  resetPasswordSchema 
} from "@/lib/validators/schemas/auth.schema";
import {
  userProfileSchema,
  studentDataSchema,
  teacherDataSchema,
  managerDataSchema,
  secretaryDataSchema
} from "@/lib/validators/schemas/user.schema";

/**
 * Tipos derivados dos schemas de autenticação
 */
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Tipos derivados dos schemas de usuários
 */
export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
export type StudentDataFormValues = z.infer<typeof studentDataSchema>;
export type TeacherDataFormValues = z.infer<typeof teacherDataSchema>;
export type ManagerDataFormValues = z.infer<typeof managerDataSchema>;
export type SecretaryDataFormValues = z.infer<typeof secretaryDataSchema>; 