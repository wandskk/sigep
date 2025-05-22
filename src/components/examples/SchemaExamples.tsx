"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Importa os schemas
import { loginSchema, registerSchema } from "@/lib/validators/schemas/auth.schema";
import { userProfileSchema } from "@/lib/validators/schemas/user.schema";

// Importa os tipos
import { 
  LoginFormValues,
  RegisterFormValues,
  UserProfileFormValues
} from "@/lib/types/schema.types";

// Exemplo básico de uso do schema de login
function LoginSchemaExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Exemplo de Schema de Login</h3>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
        {`
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "O email é obrigatório" })
    .email({ message: "Formato de email inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(1, { message: "A senha é obrigatória" }),
  remember: z.boolean().optional(),
});
        `}
      </pre>
      
      <form onSubmit={handleSubmit(console.log)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Senha"
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Testar Validação
        </button>
      </form>
    </div>
  );
}

// Demonstração de como validar dados diretamente usando o schema
function DirectValidationExample() {
  const validateEmail = (email: string) => {
    const result = loginSchema.shape.email.safeParse(email);
    return result;
  };

  const handleValidate = () => {
    const result = validateEmail("email-invalido");
    console.log("Resultado da validação:", result);
    alert(
      result.success
        ? "Email válido!"
        : `Email inválido: ${result.error.issues[0].message}`
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Validação Direta (sem formulário)</h3>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
        {`
// Valida um campo específico do schema
const validateEmail = (email: string) => {
  const result = loginSchema.shape.email.safeParse(email);
  return result;
};

// Uso
const result = validateEmail("email-invalido");
if (!result.success) {
  console.error(result.error.issues[0].message);
}
        `}
      </pre>
      
      <button
        onClick={handleValidate}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Validar "email-invalido"
      </button>
    </div>
  );
}

export function SchemaExamples() {
  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-md">
        <LoginSchemaExample />
      </div>
      
      <div className="p-6 border rounded-md">
        <DirectValidationExample />
      </div>
      
      <div className="p-6 border rounded-md">
        <h3 className="text-lg font-medium">Schemas Disponíveis</h3>
        <ul className="list-disc ml-6 mt-2 space-y-2">
          <li><code>loginSchema</code> - Validação de login</li>
          <li><code>registerSchema</code> - Validação de registro</li>
          <li><code>forgotPasswordSchema</code> - Validação de recuperação de senha</li>
          <li><code>resetPasswordSchema</code> - Validação de redefinição de senha</li>
          <li><code>userProfileSchema</code> - Validação de perfil de usuário</li>
          <li><code>studentDataSchema</code> - Validação de dados de aluno</li>
          <li><code>teacherDataSchema</code> - Validação de dados de professor</li>
          <li><code>managerDataSchema</code> - Validação de dados de gestor</li>
          <li><code>secretaryDataSchema</code> - Validação de dados de secretaria</li>
        </ul>
      </div>
    </div>
  );
} 