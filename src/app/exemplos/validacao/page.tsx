import { SchemaExamples } from "@/components/examples/SchemaExamples";

export default function ValidationExamplesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Exemplos de Schemas de Validação</h1>
      <p className="mb-6">
        Esta página demonstra como utilizar os schemas de validação Zod disponíveis
        na pasta <code>lib/validators/schemas</code>. Os schemas facilitam a validação
        de formulários e dados em toda a aplicação.
      </p>
      
      <SchemaExamples />
    </div>
  );
} 